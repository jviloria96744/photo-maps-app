import * as cognito from "aws-cdk-lib/aws-cognito";
import { Stack, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";

interface AdminAuthFlowProps {
  authCallbackUrls: string[];
}

export class AdminAuthFlow extends Construct {
  userPool: cognito.UserPool;
  adminScope: cognito.ResourceServerScope;
  resourceServer: cognito.UserPoolResourceServer;
  userPoolClient: cognito.UserPoolClient;

  constructor(parent: Stack, name: string, props: AdminAuthFlowProps) {
    super(parent, name);

    const userPool = new cognito.UserPool(this, "UserPool", {
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
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const adminScope = new cognito.ResourceServerScope({
      scopeName: "admin",
      scopeDescription: "Admin Scope",
    });

    const resourceServer = new cognito.UserPoolResourceServer(
      this,
      "UserPoolResourceServer",
      {
        scopes: [adminScope],
        userPool,
        identifier: "admin-site-resource-server",
      }
    );

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
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
        callbackUrls: props.authCallbackUrls,
      },
    });

    userPool.addDomain("admin-site-domain", {
      cognitoDomain: {
        domainPrefix: "auth-admin-portal",
      },
    });

    this.userPool = userPool;
    this.adminScope = adminScope;
    this.resourceServer = resourceServer;
    this.userPoolClient = userPoolClient;
  }
}
