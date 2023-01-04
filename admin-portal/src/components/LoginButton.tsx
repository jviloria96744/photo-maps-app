import { useState } from "react";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { MdLogin, MdAccountCircle } from "react-icons/md";

const LoginButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const tooltipLabel = isAuthenticated ? "Click to Logout" : "Click to Login";
  return (
    <Tooltip label={tooltipLabel}>
      <IconButton
        aria-label={tooltipLabel}
        colorScheme="black"
        onClick={() => setIsAuthenticated(!isAuthenticated)}
        icon={
          <Icon
            as={isAuthenticated ? MdAccountCircle : MdLogin}
            boxSize="10"
            focusable={true}
          />
        }
      />
    </Tooltip>
  );
};

export default LoginButton;
