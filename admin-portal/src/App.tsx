import { useEffect } from "react";
import Navbar from "./components/layout/Navbar";
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

  return <Navbar />;
}

export default App;
