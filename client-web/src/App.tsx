import { useEffect } from "react";
import LoginButton from "./components/LoginButton";
import { Auth } from "aws-amplify";

function App() {
  async function getCurrentUser() {
    try {
      const authUser = await Auth.currentAuthenticatedUser();
      console.log(authUser);
    } catch (e) {
      console.log("error happened", e);
    }
  }

  useEffect(() => {
    getCurrentUser();
  }, []);

  return (
    <div>
      <LoginButton />
    </div>
  );
}

export default App;
