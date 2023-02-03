import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";

interface WebSocketStackProps extends cdk.StackProps {
  pathName: string;
  cognitoUserPool: cognito.UserPool;
}

export class WebSocketStack extends cdk.NestedStack {
  api: appsync.GraphqlApi;
  constructor(scope: Construct, id: string, props: WebSocketStackProps) {
    super(scope, id, props);

    const { pathName, cognitoUserPool } = props;

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
    });

    this.api = api;
  }
}
