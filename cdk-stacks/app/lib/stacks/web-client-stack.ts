import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StaticSite } from "../../constructs/static-site";
import { WebClientAuthFlow } from "../../constructs/client-web-auth-flow";
import { createStaticSiteProps } from "../../config";

export class WebClientStack extends cdk.NestedStack {
  webClient: StaticSite;
  webClientAuthFlow: WebClientAuthFlow;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const googleClientId = process.env.GOOGLE_CLIENT_ID || "client_id";
    const googleClientSecret =
      process.env.GOOGLE_CLIENT_SECRET || "client_secret";

    const webClientProps = createStaticSiteProps("client-web");
    const webClient = new StaticSite(this, id, webClientProps);

    const webClientAuthFlow = new WebClientAuthFlow(this, "web-client", {
      googleClientId,
      googleClientSecret,
    });

    this.webClient = webClient;
    this.webClientAuthFlow = webClientAuthFlow;
  }
}
