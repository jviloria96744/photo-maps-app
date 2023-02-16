import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";

interface WebSocketStackProps extends cdk.NestedStackProps {
  pathName: string;
  cognitoUserPool: cognito.IUserPool;
  subDomainName: string;
  domainName: string;
  certificate: acm.ICertificate;
  hostedZone: route53.IHostedZone;
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
            apiKeyConfig: {
              expires: cdk.Expiration.after(cdk.Duration.days(365)),
            },
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

    this.api = api;
  }
}
