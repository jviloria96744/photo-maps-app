import LoginButton from "./components/LoginButton";
import LogoutButton from "./components/LogoutButton";
import { useAuth } from "./hooks/use-auth";

function App() {
  const auth = useAuth();
  console.log(auth.user);

  return (
    <div>
      <LoginButton />
      <LogoutButton />
    </div>
  );
}

export default App;
