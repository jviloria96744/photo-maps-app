import Typography from "@mui/material/Typography";

const PrivacyPolicyStatement = () => {
  const handleClick = () => {
    console.log("Privacy Policy Click");
  };
  return (
    <Typography variant="body2" mt={5} pl={2} pr={2}>
      "I've Been There" collects location and content data of user uploaded
      images as well as the user's location at the time of signing into the
      application. When using the application as a Guest, no user data is
      persisted and all uploaded images are deleted from our systems after 24
      hours. For more information, see the{" "}
      <a
        onClick={handleClick}
        style={{ textDecoration: "underline", cursor: "pointer" }}
      >
        privacy policy
      </a>
    </Typography>
  );
};

export default PrivacyPolicyStatement;
