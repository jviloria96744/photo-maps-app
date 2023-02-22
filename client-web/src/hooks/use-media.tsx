import React, { useContext } from "react";
import { useMediaQuery } from "@chakra-ui/react";
import { MediaContext } from "../context/MediaContext";

export function ProvideMedia({ children }: React.PropsWithChildren) {
  const media = useProvideMedia();
  return (
    <MediaContext.Provider value={media}>{children}</MediaContext.Provider>
  );
}

export const useMedia = () => useContext(MediaContext);

function useProvideMedia() {
  const [isSmallerThan768] = useMediaQuery("(max-width: 768px)");

  return {
    isMobile: isSmallerThan768,
  };
}
