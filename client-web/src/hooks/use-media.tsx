import React, { useContext } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { MediaContext } from "../context/MediaContext";

export function ProvideMedia({ children }: React.PropsWithChildren) {
  const media = useProvideMedia();
  return (
    <MediaContext.Provider value={media}>{children}</MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);

function useProvideMedia() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return {
    isMobile,
  };
}
