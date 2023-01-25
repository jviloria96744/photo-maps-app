import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from "../hooks/use-auth";

const LoginButton = () => {
  const tooltipLabel = "Click to Login";
  const auth = useAuth();

  const handleLoginClick = async () => {
    await auth.signIn();
  };

  return (
    <Tooltip label={tooltipLabel}>
      <IconButton
        aria-label={tooltipLabel}
        // colorScheme="white"
        onClick={handleLoginClick}
        icon={<Icon as={MdAccountCircle} boxSize="10" focusable={true} />}
      />
    </Tooltip>
  );
};

export default LoginButton;
