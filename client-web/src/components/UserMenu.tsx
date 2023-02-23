import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/use-auth";
import UserIconButton from "./UserIconButton";

const UserMenu = () => {
  const { signIn, signOut, signOutAndDelete, user } = useAuth();
  return (
    <Box pos="absolute" top="5" right="5" _hover={{ cursor: "pointer" }}>
      <Menu>
        <MenuButton as="div">
          <UserIconButton />
        </MenuButton>
        <MenuList>
          {user ? (
            <>
              <MenuItem onClick={signOut}>
                <Text fontSize="lg">Logout</Text>
              </MenuItem>
              <MenuItem onClick={signOutAndDelete}>
                <Text fontSize="lg">Delete Account</Text>
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={signIn}>
              <Text fontSize="lg">Login/Create Account</Text>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default UserMenu;
