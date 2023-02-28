import MaterialIconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { IconType } from "react-icons/lib";
import { STYLING_CONFIG } from "../../../config";

interface IconButtonProps {
  tooltipLabel: string | null;
  IconComponent: IconType;
  boxSize?:
    | STYLING_CONFIG.MOBILE_ICON_BOX_SIZE
    | STYLING_CONFIG.WEB_ICON_BOX_SIZE;
  color?: STYLING_CONFIG.COLOR_PRIMARY | STYLING_CONFIG.COLOR_SECONDARY;
  clickHandler?: () => void;
}

const Button = (props: IconButtonProps) => {
  const { color, clickHandler, boxSize, IconComponent } = props;
  return (
    <MaterialIconButton
      disableFocusRipple
      disableRipple
      color={color ?? STYLING_CONFIG.COLOR_PRIMARY}
      onClick={clickHandler}
    >
      <IconComponent size={boxSize ?? STYLING_CONFIG.WEB_ICON_BOX_SIZE} />
    </MaterialIconButton>
  );
};
const IconButton = (props: IconButtonProps) => {
  const { tooltipLabel } = props;
  if (tooltipLabel) {
    return <Tooltip title={tooltipLabel}>{Button(props)}</Tooltip>;
  } else {
    return Button(props);
  }
};

export default IconButton;
