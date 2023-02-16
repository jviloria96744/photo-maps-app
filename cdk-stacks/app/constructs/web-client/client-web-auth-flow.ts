import * as cognito from "aws-cdk-lib/aws-cognito";
import { Stack, RemovalPolicy, Duration, SecretValue } from "aws-cdk-lib";
import { Construct } from "constructs";

interface WebClientAuthFlowProps {
  googleClientId: string;
  googleClientSecretValue: SecretValue;
  callbackUrls: string[];
}

export class WebClientAuthFlow extends Construct {
  userPool: cognito.UserPool;
  userPoolIdentityProviderGoogle: cognito.UserPoolIdentityProviderGoogle;
  adminScope: cognito.ResourceServerScope;
  resourceServer: cognito.UserPoolResourceServer;
  userPoolClient: cognito.UserPoolClient;

  constructor(parent: Stack, name: string, props: WebClientAuthFlowProps) {
    super(parent, name);

    const { googleClientId, googleClientSecretValue, callbackUrls } = props;

    const userPool = new cognito.UserPool(this, "UserPool", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    userPool.addDomain("Domain", {
      cognitoDomain: {
        domainPrefix: "client-web",
      },
    });

    const userPoolIdentityProviderGoogle =
      new cognito.UserPoolIdentityProviderGoogle(this, "GoogleIdp", {
        userPool,
        clientId: googleClientId,
        clientSecretValue: googleClientSecretValue,
        scopes: ["profile", "email", "openid"],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
        },
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
        identifier: `${name}-resource-server`,
      }
    );

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      accessTokenValidity: Duration.minutes(60),
      idTokenValidity: Duration.minutes(60),
      generateSecret: false,
      refreshTokenValidity: Duration.days(1),
      enableTokenRevocation: true,
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.resourceServer(resourceServer, adminScope),
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.COGNITO_ADMIN,
        ],
        callbackUrls: callbackUrls,
        logoutUrls: callbackUrls,
      },
    });

    this.userPool = userPool;
    this.userPoolIdentityProviderGoogle = userPoolIdentityProviderGoogle;
    this.adminScope = adminScope;
    this.resourceServer = resourceServer;
    this.userPoolClient = userPoolClient;
  }
}
