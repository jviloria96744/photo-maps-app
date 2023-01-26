import AppContainer from "./components/base/layout/AppContainer";
import UserMenu from "./components/UserMenu";
import UploadPhotoIconButton from "./components/UploadPhotoButton";

function App() {
  return (
    <AppContainer>
      <UserMenu />
      <UploadPhotoIconButton />
    </AppContainer>
  );
}

export default App;
