export interface ExifParseResponse {
  status: string;
  GPSDateStamp: string;
  GPSLatitude: number[];
  GPSLatitudeRef: string;
  GPSLongitude: number[];
  GPSLongitudeRef: string;
  ImageHeight: number;
  ImageWidth: number;
  latitude: number;
  longitude: number;
}
