import IconButton from "./base/utility/IconButton";
import { MdAccountCircle } from "react-icons/md";

const UserIconButton = () => {
  return (
    <IconButton
      tooltipLabel="User Menu"
      IconComponent={MdAccountCircle}
      ariaLabel="User Menu"
    />
  );
};

export default UserIconButton;
