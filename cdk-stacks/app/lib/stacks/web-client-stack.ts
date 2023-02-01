import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { StaticSite } from "../../constructs/static-site";
import { WebClientAuthFlow } from "../../constructs/client-web-auth-flow";
import { SecretValue } from "aws-cdk-lib";

interface WebClientStackProps extends cdk.NestedStackProps {
  siteDomain: string;
  pathName: string;
  certificate: acm.Certificate;
  hostedZone: route53.IHostedZone;
  authCallbackUrls: string[];
  clientIdKey: string;
  clientSecretKey: string;
}

export class WebClientStack extends cdk.NestedStack {
  webClient: StaticSite;
  webClientAuthFlow: WebClientAuthFlow;
  constructor(scope: Construct, id: string, props: WebClientStackProps) {
    super(scope, id, props);

    const webClient = new StaticSite(this, `${id}`, props);

    const googleClientId = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "ClientId",
      {
        parameterName: props.clientIdKey,
      }
    ).stringValue;

    const googleClientSecretValue = this.getGoogleClientSecret(
      props.clientSecretKey
    );

    const webClientAuthFlow = new WebClientAuthFlow(this, `${id}-Auth`, {
      googleClientId,
      googleClientSecretValue,
      callbackUrls: props.authCallbackUrls,
    });

    this.webClient = webClient;
    this.webClientAuthFlow = webClientAuthFlow;
  }

  private getGoogleClientSecret(clientSecretKey: string): SecretValue {
    const googleClientSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      `Secret`,
      clientSecretKey
    );

    return googleClientSecret.secretValueFromJson("clientSecretValue");
  }
}
