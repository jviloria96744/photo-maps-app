import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import PrivacyPolicyStatement from "./PrivacyPolicyStatement";
import { useWindowSize } from "../../hooks/use-window-size";
import { useMedia } from "../../hooks/use-media";
import { useAuth } from "../../hooks/use-auth";
import { ENV, MAP_CONFIG } from "../../config";
import GlobeLogo from "../../assets/globe-logo.svg";
import GoogleSignInLogo from "../../assets/btn_google_signin_light_normal_web.png";

const getMapBoxUrl = (
  lat: string,
  lng: string,
  accessToken: string,
  width: number,
  height: number
) => {
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},10,0.00,0.00/${Math.min(
    Math.round(width * 0.3),
    1280
  )}x${Math.min(height, 1280)}?access_token=${accessToken}`;
};

const LoginPage = () => {
  const { width, height } = useWindowSize();
  const { isMobile } = useMedia();
  const { signIn } = useAuth();

  const newYorkMapBoxUrl = getMapBoxUrl(
    MAP_CONFIG.NEW_YORK_LAT,
    MAP_CONFIG.NEW_YORK_LNG,
    ENV.VITE_MAPBOX_ACCESS_TOKEN,
    width,
    height
  );
  const londonMapBoxUrl = getMapBoxUrl(
    MAP_CONFIG.LONDON_LAT,
    MAP_CONFIG.LONDON_LNG,
    ENV.VITE_MAPBOX_ACCESS_TOKEN,
    width,
    height
  );

  return (
    <Grid container sx={{ height: "100%" }}>
      {!isMobile && (
        <Grid item md={4}>
          <img
            alt="New York City, USA"
            src={newYorkMapBoxUrl}
            style={{ width: "100%", height: "100%" }}
          />
        </Grid>
      )}
      <Grid
        item
        md={isMobile ? 8 : 4}
        textAlign="center"
        style={{ background: "#fafafa" }}
      >
        <Typography
          variant={isMobile ? "h5" : "h1"}
          mt={isMobile ? 10 : 5}
          mb={5}
        >
          I've Been There
        </Typography>
        <img
          src={GlobeLogo}
          style={{
            width: isMobile ? "250px" : "480px",
            height: isMobile ? "180px" : "350px",
            marginBottom: "40px",
          }}
        />
        <Button
          size="medium"
          sx={{
            marginBottom: "8px",
            marginRight: isMobile ? "0px" : "40px",
            "&.MuiButtonBase-root:hover": {
              bgcolor: "transparent",
            },
          }}
          onClick={signIn}
        >
          <img src={GoogleSignInLogo} />
        </Button>
        <Button
          size="medium"
          variant="outlined"
          color="primary"
          disableElevation
          sx={{
            marginBottom: "8px",
            marginLeft: isMobile ? "0px" : "40px",
          }}
        >
          Try it out as a Guest
        </Button>
        <PrivacyPolicyStatement />
      </Grid>
      {!isMobile && (
        <Grid item md={4}>
          <img
            alt="London, UK"
            src={londonMapBoxUrl}
            style={{ width: "100%", height: "100%" }}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default LoginPage;
