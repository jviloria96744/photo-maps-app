import IconButton from "./base/utility/IconButton";
import { MdAccountCircle } from "react-icons/md";
import { useMedia } from "../hooks/use-media";

const UserIconButton = () => {
  const { isMobile } = useMedia();
  return (
    <IconButton
      tooltipLabel="User Menu"
      IconComponent={MdAccountCircle}
      ariaLabel="User Menu"
      boxSize={isMobile ? "40px" : "50px"}
    />
  );
};

export default UserIconButton;
