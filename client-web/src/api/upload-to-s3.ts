import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getPreSignedPost } from "./base-endpoints";
import {
  PresignedPostResponse,
  PresignedPostResponseFields,
} from "../models/photo";

export const uploadPhotosToS3 = (photos: FileList): void => {
  for (let i = 0; i < photos.length; i++) {
    uploadPhotoToS3(photos[i]);
  }
};
export const uploadPhotoToS3 = (photo: File): void => {
  const photoId = uuidv4();
  const extension = photo.name.split(".").pop() || "";

  getPreSignedPost({
    asset_uuid: photoId,
    asset_extension: extension,
  }).then((res: PresignedPostResponse) => {
    const { url, fields } = res;
    const photoFormData = new FormData();
    let k: keyof PresignedPostResponseFields;
    for (k in fields) {
      photoFormData.append(k, fields[k]);
    }
    photoFormData.append("file", photo);
    axios({
      method: "post",
      url: url,
      data: photoFormData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
