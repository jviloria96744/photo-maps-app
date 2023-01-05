import * as cognito from "aws-cdk-lib/aws-cognito";
import { CfnOutput, Stack, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";

export class AdminAuthFlow extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent, name);

    const userPool = new cognito.UserPool(this, `${name}-userpool`, {
      selfSignUpEnabled: false,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      userVerification: {
        emailSubject: "Please verify your email",
        emailBody: "Verification Code: {####}",
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const adminScope = new cognito.ResourceServerScope({
      scopeName: "admin",
      scopeDescription: "Admin Scope",
    });

    const resourceServer = new cognito.UserPoolResourceServer(
      this,
      `${name}-user-pool-resource-server`,
      {
        scopes: [adminScope],
        userPool,
        identifier: "admin-site-resource-server",
      }
    );

    new CfnOutput(this, "userPoolId", {
      value: userPool.userPoolId,
    });

    const userPoolClient = new cognito.UserPoolClient(
      this,
      `${name}-user-pool-client`,
      {
        userPool,
        accessTokenValidity: Duration.minutes(60),
        idTokenValidity: Duration.minutes(60),
        generateSecret: false,
        refreshTokenValidity: Duration.days(1),
        enableTokenRevocation: true,
        preventUserExistenceErrors: true,
        authFlows: {
          userPassword: true,
        },
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.resourceServer(resourceServer, adminScope),
          ],
          callbackUrls: ["http://localhost:5173/"],
        },
      }
    );

    userPool.addDomain("admin-site-domain", {
      cognitoDomain: {
        domainPrefix: "auth-admin-portal",
      },
    });

    new CfnOutput(this, "userPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
  }
}
