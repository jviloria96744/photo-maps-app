import { Auth } from "aws-amplify";

export const getIdToken = async () => {
  const currentSession = await Auth.currentSession();
  const idToken = currentSession.getIdToken().getJwtToken();
  return idToken;
};

export const EXIF_TAGS = [
  "ImageHeight",
  "ImageWidth",
  "GPSDateStamp",
  "GPSLatitude",
  "GPSLatitudeRef",
  "GPSLongitude",
  "GPSLongitudeRef",
];
