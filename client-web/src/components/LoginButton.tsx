import { Auth } from "aws-amplify";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { MdAccountCircle } from "react-icons/md";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";

const LoginButton = () => {
  const tooltipLabel = "Click to Login";

  const handleLoginClick = async () => {
    await Auth.federatedSignIn({
      provider: CognitoHostedUIIdentityProvider.Google,
    });
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
