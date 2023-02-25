import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getPreSignedPost } from "./base-endpoints";
import {
  PresignedPostResponse,
  PresignedPostResponseFields,
  GeoPoint,
} from "../models/photo";
import { ExifParseResponse } from "./types";
import exifr from "exifr";
import { EXIF_TAGS } from "./utils";

export const uploadPhotosToS3 = async (
  photos: FileList,
  setPhotosFunc: (newPhotos: GeoPoint[]) => void
): Promise<void> => {
  const uploadPhotosPromiseArray: Promise<any>[] = [];
  const photoArray: GeoPoint[] = [];
  for (let i = 0; i < photos.length; i++) {
    const photoId = uuidv4();
    const extension = photos[i].name.split(".").pop() || "";

    uploadPhotosPromiseArray.push(
      uploadPhotoToS3(photos[i], photoId, extension)
    );
  }

  Promise.allSettled(uploadPhotosPromiseArray).then((res) => {
    res.forEach((uploadPhotoResponse) => {
      if (uploadPhotoResponse.status === "fulfilled") {
        photoArray.push(uploadPhotoResponse.value);
      }
    });
    setPhotosFunc(photoArray);
  });
};

const uploadPhotoToS3 = async (
  photo: File,
  photoId: string,
  photoExtension: string
): Promise<GeoPoint> => {
  const parsedExifData: ExifParseResponse = await exifr.parse(photo, EXIF_TAGS);

  if (!(parsedExifData.latitude && parsedExifData.longitude)) {
    return Promise.reject(new Error("Failed to extract EXIF Data"));
  }

  const res: PresignedPostResponse = await getPreSignedPost({
    asset_uuid: photoId,
    asset_extension: photoExtension,
    endpoint: "/photo",
    custom_fields: {
      "x-amz-meta-latitude": String(parsedExifData.latitude),
      "x-amz-meta-longitude": String(parsedExifData.longitude),
      "x-amz-meta-date": parsedExifData.GPSDateStamp.replaceAll(":", "-"),
      "x-amz-meta-width": String(parsedExifData.ImageWidth),
      "x-amz-meta-height": String(parsedExifData.ImageHeight),
    },
  });

  if (!res.fields.key) {
    return Promise.reject(new Error("Failed to generate presigned post"));
  }

  const upload = await constructAndPostForm(res, photo);
  if (upload.status !== 204) {
    return Promise.reject(new Error("Failed to upload to s3 bucket"));
  }

  return Promise.resolve({
    object_key: res.fields.key,
    lat: String(parsedExifData.latitude),
    lng: String(parsedExifData.longitude),
  });
};

const constructAndPostForm = (
  data: PresignedPostResponse,
  file: any
): Promise<any> => {
  const { url, fields } = data;
  const formData = new FormData();
  let k: keyof PresignedPostResponseFields;
  for (k in fields) {
    formData.append(k, fields[k]);
  }
  formData.append("file", file);

  return axios({
    method: "post",
    url: url,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
