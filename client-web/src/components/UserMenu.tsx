import { useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { MdAccountCircle } from "react-icons/md";
import { useAuth } from "../hooks/use-auth";
import { useMedia } from "../hooks/use-media";
import { STYLING_CONFIG } from "../config";
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
        color={STYLING_CONFIG.COLOR_PRIMARY}
        onClick={handleClick}
      >
        <MdAccountCircle
          size={
            isMobile
              ? STYLING_CONFIG.MOBILE_ICON_BOX_SIZE
              : STYLING_CONFIG.WEB_ICON_BOX_SIZE
          }
        />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose(null)}>
        {user ? (
          <div>
            <MenuItem onClick={() => handleClose(signOut)}>
              <Typography
                variant={
                  isMobile
                    ? STYLING_CONFIG.MOBILE_USER_MENU_FONT_SIZE
                    : STYLING_CONFIG.WEB_USER_MENU_FONT_SIZE
                }
              >
                Logout
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => handleClose(signOutAndDelete)}>
              <Typography
                variant={
                  isMobile
                    ? STYLING_CONFIG.MOBILE_USER_MENU_FONT_SIZE
                    : STYLING_CONFIG.WEB_USER_MENU_FONT_SIZE
                }
              >
                Delete Account
              </Typography>
            </MenuItem>
          </div>
        ) : (
          <MenuItem onClick={() => handleClose(signIn)}>
            <Typography
              variant={
                isMobile
                  ? STYLING_CONFIG.MOBILE_USER_MENU_FONT_SIZE
                  : STYLING_CONFIG.WEB_USER_MENU_FONT_SIZE
              }
            >
              Login/Create Account
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default UserMenu;
