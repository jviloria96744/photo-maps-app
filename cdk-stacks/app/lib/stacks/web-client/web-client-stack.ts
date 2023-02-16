import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { StaticSite } from "../../../constructs/static-site";
import { WebClientAuthFlow } from "../../../constructs/web-client/client-web-auth-flow";
import { lookupResource } from "../../../utils/utils";

interface WebClientStackProps extends cdk.StackProps {
  domainName: string;
  siteDomain: string;
  pathName: string;
  certificateParameterStoreName: string;
  authCallbackUrls: string[];
  clientIdKey: string;
  clientSecretKey: string;
  userpoolParameterStoreName: string;
}

export class WebClientStack extends cdk.Stack {
  webClient: StaticSite;
  webClientAuthFlow: WebClientAuthFlow;
  constructor(scope: Construct, id: string, props: WebClientStackProps) {
    super(scope, id, props);

    const {
      domainName,
      siteDomain,
      pathName,
      certificateParameterStoreName,
      authCallbackUrls,
      clientIdKey,
      clientSecretKey,
      userpoolParameterStoreName,
    } = props;

    const zone = route53.HostedZone.fromLookup(this, `HostedZone`, {
      domainName: domainName,
    });

    const webClientCertificate = lookupResource(
      this,
      "WebClientCertificate",
      certificateParameterStoreName,
      acm.Certificate.fromCertificateArn
    );

    const webClient = new StaticSite(this, `${id}`, {
      siteDomain,
      pathName,
      certificate: webClientCertificate,
      hostedZone: zone,
    });

    const { googleClientId, googleClientSecretValue } =
      this.getGoogleClientData(clientIdKey, clientSecretKey);

    const webClientAuthFlow = new WebClientAuthFlow(this, `${id}-Auth`, {
      googleClientId,
      googleClientSecretValue,
      callbackUrls: authCallbackUrls,
    });

    new ssm.StringParameter(this, "UserpoolParameter", {
      parameterName: userpoolParameterStoreName,
      stringValue: webClientAuthFlow.userPool.userPoolArn,
    });

    this.webClient = webClient;
    this.webClientAuthFlow = webClientAuthFlow;
  }

  private getGoogleClientData(
    clientIdKey: string,
    clientSecretKey: string
  ): { googleClientId: string; googleClientSecretValue: cdk.SecretValue } {
    const googleClientId = ssm.StringParameter.fromStringParameterAttributes(
      this,
      "ClientId",
      {
        parameterName: clientIdKey,
      }
    ).stringValue;

    const googleClientSecretValue = secretsmanager.Secret.fromSecretNameV2(
      this,
      `Secret`,
      clientSecretKey
    );

    return {
      googleClientId: googleClientId,
      googleClientSecretValue:
        googleClientSecretValue.secretValueFromJson("clientSecretValue"),
    };
  }
}
