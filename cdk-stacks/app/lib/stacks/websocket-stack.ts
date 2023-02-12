import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as events from "aws-cdk-lib/aws-events";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface WebSocketStackProps extends cdk.StackProps {
  pathName: string;
  cognitoUserPool: cognito.UserPool;
  subDomainName: string;
  domainName: string;
  certificate: acm.Certificate;
  hostedZone: route53.IHostedZone;
  eventBus: events.EventBus;
}

export class WebSocketStack extends cdk.NestedStack {
  api: appsync.GraphqlApi;
  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);

    const {
      pathName,
      cognitoUserPool,
      domainName,
      certificate,
      hostedZone,
      subDomainName,
      eventBus,
    } = props;

    const api = new appsync.GraphqlApi(this, "GraphQLApi", {
      name: "WS-API",
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: cognitoUserPool,
          },
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.API_KEY,
          },
        ],
      },
      schema: appsync.SchemaFile.fromAsset(pathName),
      domainName: {
        domainName,
        certificate,
      },
    });

    const mutationResolver = new appsync.Resolver(this, "MutationResolver", {
      api,
      typeName: "Mutation",
      fieldName: "publish2channel",
      dataSource: api.addNoneDataSource("pubsub"),
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "payload": {
            "name": "$context.arguments.name",
            "data": $util.toJson($context.arguments.data)  
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        `$util.toJson($context.result)`
      ),
    });

    new route53.CnameRecord(this, "CNameRecord", {
      recordName: subDomainName,
      domainName: api.appSyncDomainName,
      zone: hostedZone,
    });

    // TODO: ADD API KEY TO SECRETS MANAGER AND FETCH FROM THERE
    const eventBusAppSyncConnection = new events.Connection(
      this,
      "BusAppSyncConnection",
      {
        authorization: events.Authorization.apiKey(
          "x-api-key",
          cdk.SecretValue.unsafePlainText(api.apiKey || "")
        ),
      }
    );

    const eventBusDestination = new events.ApiDestination(
      this,
      "BusApiDestination",
      {
        connection: eventBusAppSyncConnection,
        endpoint: api.graphqlUrl,
        httpMethod: events.HttpMethod.POST,
      }
    );

    const invokeRole = new iam.Role(this, "InvokeRole", {
      assumedBy: new iam.ServicePrincipal("events.amazonaws.com"),
      inlinePolicies: {
        invokeApi: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              resources: ["*"],
              actions: ["events:InvokeApiDestination"],
            }),
          ],
        }),
      },
    });

    const appSyncRule = new events.CfnRule(this, "AppSyncRule", {
      eventBusName: eventBus.eventBusName,
      eventPattern: {
        detailType: ["ImagesUploadMessageFromStepFunctions"],
        source: ["step.functions"],
      },
      targets: [
        {
          arn: eventBusDestination.apiDestinationArn,
          id: "AppSyncTarget",
          roleArn: invokeRole.roleArn,
          inputTransformer: {
            inputPathsMap: {
              name: "$.detail.channel",
              data: "$.detail.data",
            },
            inputTemplate: `{
             "query": "mutation Publish2channel($data: AWSJSON!, $name: String!) {
                publish2channel(data: $data, name: $name) {
                  data
                  name
                }
              }"
            }`.replace(/\n\s*/g, " "),
          },
        },
      ],
    });

    this.api = api;
  }
}
