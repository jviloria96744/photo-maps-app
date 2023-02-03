import * as cdk from "aws-cdk-lib";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";

interface WebSocketStackProps extends cdk.StackProps {
  pathName: string;
  cognitoUserPool: cognito.UserPool;
  domainName: string;
  certificate: acm.Certificate;
  hostedZone: route53.IHostedZone;
}

export class WebSocketStack extends cdk.NestedStack {
  api: appsync.GraphqlApi;
  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);

    const { pathName, cognitoUserPool, domainName, certificate, hostedZone } =
      props;

    const api = new appsync.GraphqlApi(this, "GraphQLApi", {
      name: "WS-API",
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: cognitoUserPool,
          },
        },
      },
      schema: appsync.SchemaFile.fromAsset(pathName),
      domainName: {
        domainName,
        certificate,
      },
    });

    new route53.CnameRecord(this, "CNameRecord", {
      domainName: api.appSyncDomainName,
      zone: hostedZone,
    });

    this.api = api;
  }
}
