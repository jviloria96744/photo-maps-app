import { useState } from "react";
import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { MdLogin, MdAccountCircle } from "react-icons/md";

const LoginButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const tooltipLabel = isAuthenticated ? "Click to Logout" : "Click to Login";

  const createHostedUiUrl = (): string => {
    const domain: string = import.meta.env.VITE_COGNITO_DOMAIN || "";
    const awsRegion: string = import.meta.env.VITE_AWS_REGION || "";
    const cognitoClientId: string =
      import.meta.env.VITE_USERPOOL_WEB_CLIENT_ID || "";
    const baseUrl = window.location.href;
    return `https://${domain}.auth.${awsRegion}.amazoncognito.com/login?client_id=${cognitoClientId}&response_type=code&scope=admin-site-resource-server/admin+openid&redirect_uri=${baseUrl}`;
  };
  const handleLoginClick = () => {
    if (!isAuthenticated) {
      window.location.href = createHostedUiUrl();
    }
  };
  return (
    <Tooltip label={tooltipLabel}>
      <IconButton
        aria-label={tooltipLabel}
        colorScheme="black"
        onClick={handleLoginClick}
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
