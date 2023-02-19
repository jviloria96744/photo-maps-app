import { useState, useEffect } from "react";

const getWindowSize = (): { width: number; height: number } => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<
    ReturnType<typeof getWindowSize>
  >(getWindowSize());

  useEffect(() => {
    function handleResize() {
      setWindowSize(getWindowSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};
