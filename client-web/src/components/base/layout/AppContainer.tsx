import { Box } from "@chakra-ui/react";

const AppContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <Box w="full" h="full">
      {children}
    </Box>
  );
};

export default AppContainer;
