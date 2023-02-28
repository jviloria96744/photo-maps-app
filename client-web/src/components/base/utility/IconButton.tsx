import MaterialIconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { IconType } from "react-icons/lib";

interface IconButtonProps {
  tooltipLabel: string | null;
  IconComponent: IconType;
  boxSize?: string;
  ariaLabel: string;
  variant?: string;
  color?: "primary" | "secondary";
  clickHandler?: () => void;
  photoUploadRef?: React.MutableRefObject<HTMLInputElement | null>;
}

const IconButton = ({
  tooltipLabel,
  IconComponent,
  boxSize,
  clickHandler,
  color,
}: IconButtonProps) => {
  if (tooltipLabel) {
    return (
      <Tooltip title={tooltipLabel}>
        <MaterialIconButton
          disableFocusRipple
          disableRipple
          color={color ?? "primary"}
          onClick={clickHandler}
        >
          <IconComponent size={boxSize ?? "75"} />
        </MaterialIconButton>
      </Tooltip>
    );
  } else {
    return (
      <MaterialIconButton
        disableFocusRipple
        disableRipple
        color={color ?? "primary"}
        onClick={clickHandler}
      >
        <IconComponent size={boxSize ?? "75"} />
      </MaterialIconButton>
    );
  }
};

export default IconButton;
