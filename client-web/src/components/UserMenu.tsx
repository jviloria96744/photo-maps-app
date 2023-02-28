import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from "../hooks/use-auth";
import { useMedia } from "../hooks/use-media";
import "./styles.css";

const UserMenu = () => {
  const { signIn, signOut, signOutAndDelete, user } = useAuth();
  const { isMobile } = useMedia();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (callbackFunc: null | (() => Promise<void>)): void => {
    setAnchorEl(null);

    if (callbackFunc) {
      callbackFunc();
    }
  };
  return (
    <div
      className={
        isMobile ? "user-menu-container-mobile" : "user-menu-container-web"
      }
    >
      <IconButton
        disableFocusRipple
        disableRipple
        color="primary"
        onClick={handleClick}
      >
        <MdAccountCircle size={isMobile ? "38" : "50"} />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
        {user ? (
          <div>
            <MenuItem onClick={() => handleClose(signOut)}>
              <Typography variant={isMobile ? "body2" : "h4"}>
                Logout
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => handleClose(signOutAndDelete)}>
              <Typography variant={isMobile ? "body2" : "h4"}>
                Delete Account
              </Typography>
            </MenuItem>
          </div>
        ) : (
          <MenuItem onClick={() => handleClose(signIn)}>
            <Typography variant={isMobile ? "body2" : "h4"}>
              Login/Create Account
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default UserMenu;
