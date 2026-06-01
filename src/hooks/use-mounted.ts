import { useEffect, useState } from "react";

/** True after the component has mounted on the client (safe for Radix, theme, motion). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
