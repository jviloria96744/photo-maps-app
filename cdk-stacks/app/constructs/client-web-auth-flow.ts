import * as cognito from "aws-cdk-lib/aws-cognito";
import { CfnOutput, Stack, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import { webClientCallbackUrls } from "../config";

interface WebClientAuthFlowProps {
  googleClientId: string;
  googleClientSecret: string;
}

export class WebClientAuthFlow extends Construct {
  userPool: cognito.UserPool;
  userPoolIdentityProviderGoogle: cognito.UserPoolIdentityProviderGoogle;
  adminScope: cognito.ResourceServerScope;
  resourceServer: cognito.UserPoolResourceServer;
  userPoolClient: cognito.UserPoolClient;

  constructor(parent: Stack, name: string, props: WebClientAuthFlowProps) {
    super(parent, name);

    const { googleClientId, googleClientSecret } = props;

    const userPool = new cognito.UserPool(this, `${name}-userpool`, {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    userPool.addDomain(`${name}-domain`, {
      cognitoDomain: {
        domainPrefix: name,
      },
    });

    const userPoolIdentityProviderGoogle =
      new cognito.UserPoolIdentityProviderGoogle(this, "google-idp", {
        userPool,
        clientId: googleClientId,
        clientSecret: googleClientSecret,
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
      `${name}-user-pool-resource-server`,
      {
        scopes: [adminScope],
        userPool,
        identifier: `${name}-resource-server`,
      }
    );

    new CfnOutput(this, `${name}-userPoolId`, {
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
          ],
          callbackUrls: webClientCallbackUrls,
        },
      }
    );

    new CfnOutput(this, `${name}-userPoolClientId`, {
      value: userPoolClient.userPoolClientId,
    });

    this.userPool = userPool;
    this.userPoolIdentityProviderGoogle = userPoolIdentityProviderGoogle;
    this.adminScope = adminScope;
    this.resourceServer = resourceServer;
    this.userPoolClient = userPoolClient;
  }
}
