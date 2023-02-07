import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { getPreSignedPost } from "./base-endpoints";
import {
  PresignedPostResponse,
  PresignedPostResponseFields,
} from "../models/photo";
import { User } from "../models/user";

export const uploadPhotosToS3 = (photos: FileList, user: User): void => {
  const uploadPhotosPromiseArray: Promise<any>[] = [];
  const photoIdArray: string[] = [];
  for (let i = 0; i < photos.length; i++) {
    const photoId = uuidv4();
    const extension = photos[i].name.split(".").pop() || "";
    uploadPhotosPromiseArray.push(
      uploadPhotoToS3(photos[i], photoId, extension, photoIdArray)
    );
  }

  Promise.allSettled(uploadPhotosPromiseArray).then(() => {
    const manifestJson = {
      userId: user.id,
      imageIds: photoIdArray,
    };
    const manifestId = uuidv4();
    getPreSignedPost({
      asset_uuid: manifestId,
      asset_extension: "json",
      endpoint: "/photo_manifest",
    }).then((res: PresignedPostResponse) => {
      constructAndPostForm(res, JSON.stringify(manifestJson));
    });
  });
};

const uploadPhotoToS3 = (
  photo: File,
  photoId: string,
  photoExtension: string,
  photoIdArray: string[]
): Promise<any> => {
  return getPreSignedPost({
    asset_uuid: photoId,
    asset_extension: photoExtension,
    endpoint: "/photo",
  }).then((res: PresignedPostResponse) => {
    photoIdArray.push(res.fields.key);

    constructAndPostForm(res, photo);
  });
};

const constructAndPostForm = (data: PresignedPostResponse, file: any): void => {
  const { url, fields } = data;
  const formData = new FormData();
  let k: keyof PresignedPostResponseFields;
  for (k in fields) {
    formData.append(k, fields[k]);
  }
  formData.append("file", file);

  axios({
    method: "post",
    url: url,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
