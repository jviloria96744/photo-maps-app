import { Box, Text, Flex, Spacer } from "@chakra-ui/react";
import LoginButton from "../LoginButton";

const Navbar = () => {
  return (
    <Box bg="black" w="100%" h="10%" color="white" p="2">
      <Flex alignItems="center">
        <Text fontSize="4xl">Photo Maps App Admin Portal</Text>
        <Spacer />
        <LoginButton />
      </Flex>
    </Box>
  );
};

export default Navbar;
