"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";

export default function ThemeInitializer() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
}
