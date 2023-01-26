import {
  Icon,
  IconButton as ChakraIconButton,
  Tooltip,
} from "@chakra-ui/react";
import { IconType } from "react-icons/lib";

interface IconButtonProps {
  tooltipLabel: string | null;
  IconComponent: IconType;
  boxSize?: string;
  ariaLabel: string;
  clickHandler?: () => void;
  photoUploadRef?: React.MutableRefObject<HTMLInputElement | null>;
}

const IconButton = ({
  tooltipLabel,
  IconComponent,
  boxSize,
  ariaLabel,
  clickHandler,
}: IconButtonProps) => {
  if (tooltipLabel) {
    return (
      <Tooltip label={tooltipLabel}>
        <ChakraIconButton
          aria-label={tooltipLabel}
          onClick={clickHandler}
          icon={
            <Icon
              as={IconComponent}
              boxSize={boxSize ?? "10"}
              focusable={true}
            />
          }
        />
      </Tooltip>
    );
  } else {
    return (
      <ChakraIconButton
        aria-label={ariaLabel}
        icon={
          <Icon as={IconComponent} boxSize={boxSize ?? "10"} focusable={true} />
        }
      />
    );
  }
};

export default IconButton;
