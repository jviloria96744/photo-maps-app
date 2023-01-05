import { StaticSiteProps } from "../constructs/static-site";

export const domainName = "jviloria.com";
export const subDomain = "photo-maps-app";
export const siteBuildDirectory = "dist";

type SiteName = "admin-portal" | "client-web";

export const createStaticSiteProps = (siteName: SiteName): StaticSiteProps => {
  switch (siteName) {
    case "admin-portal":
      return {
        domainName,
        siteSubDomain: `${siteName}.${subDomain}`,
        siteBuildDirectory,
        siteDirectory: siteName,
      };
    case "client-web":
      return {
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
