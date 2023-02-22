import { createContext } from "react";

interface IMediaContext {
  isMobile: boolean;
}

export const MediaContext = createContext<IMediaContext>({
  isMobile: false,
});
