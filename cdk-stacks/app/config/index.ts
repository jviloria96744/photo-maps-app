import { StaticSiteProps } from "../constructs/static-site";

const basePath = process.env.GITHUB_WORKSPACE || "";

export const domainName = "jviloria.com";
export const subDomain = "photo-maps-app";
export const siteBuildDirectory = "dist";

type SiteName = "admin-portal" | "client-web";

export const createStaticSiteProps = (siteName: SiteName): StaticSiteProps => {
  switch (siteName) {
    case "admin-portal":
      return {
        basePath,
        domainName,
        siteSubDomain: `${siteName}.${subDomain}`,
        siteBuildDirectory,
        siteDirectory: siteName,
      };
    case "client-web":
      return {
        basePath,
        domainName,
        siteSubDomain: subDomain,
        siteBuildDirectory,
        siteDirectory: siteName,
      };
    default:
      throw "siteName is not correct";
  }
};

export const adminSiteCallbackUrls: string[] = [
  "http://localhost:5173/",
  `https://admin-portal.${subDomain}.${domainName}/`,
];

export const webClientCallbackUrls: string[] = [
  "http://localhost:5173/",
  "http://localhost:3000/",
  `https://${subDomain}.${domainName}/`,
];

const removeTests = "rm -rf /asset-output/tests";
const removeDevRequirements = "rm -f requirements_dev.txt";
const removeEventsDirectory = "rm -rf /asset-output/events";
const removeStatements = `${removeTests} && ${removeDevRequirements} && ${removeEventsDirectory}`;

export const lambdaBuildCommands = [
  "bash",
  "-c",
  `pip install -r requirements.txt -t /asset-output && cp -au . /asset-output && ${removeStatements}`,
];
