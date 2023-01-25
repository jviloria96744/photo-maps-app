import { Box } from "@chakra-ui/react";

const AppContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <Box bg="blueviolet" w="100%" h="calc(100vh)">
      {children}
    </Box>
  );
};

export default AppContainer;
