import { useEffect } from "react";

export const useScrollToTop = () => {
  useEffect(() => {
    // Try scrolling the #root container first (for mobile fixed body layout)
    const root = document.getElementById("root");
    if (root) {
      root.scrollTo(0, 0);
    }
    // Also scroll window as fallback
    window.scrollTo(0, 0);
  }, []);
};
