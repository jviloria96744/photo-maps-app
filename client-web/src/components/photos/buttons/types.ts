import { MutableRefObject, ChangeEvent } from "react";
import { IconType } from "react-icons";

export interface PhotoUploadButtonProps {
  inputRef: MutableRefObject<HTMLInputElement | null>;
  handleUploadClick: () => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  iconComponent: IconType;
}
