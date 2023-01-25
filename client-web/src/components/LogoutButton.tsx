import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../hooks/use-auth";

const LogoutButton = () => {
  const tooltipLabel = "Click to Logout";
  const auth = useAuth();

  const handleLogoutClick = async () => {
    await auth.signOut();
  };

  return (
    <Tooltip label={tooltipLabel}>
      <IconButton
        aria-label={tooltipLabel}
        // colorScheme="white"
        onClick={handleLogoutClick}
        icon={<Icon as={MdLogout} boxSize="10" focusable={true} />}
      />
    </Tooltip>
  );
};

export default LogoutButton;
