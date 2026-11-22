"use client";

import { useState, useEffect, useCallback } from "react";

// Shared dark-mode state that PERSISTS across page navigations.
// The choice is stored in localStorage and applied to <html class="dark"> so it
// stays consistent on every page (fixes dark mode resetting when navigating).
// A matching inline script in layout.tsx applies the class before first paint
// to avoid a flash of the light theme.

const KEY = "ui-dark";
const EVENT = "ui-dark-change";

export function getStoredDark(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setStoredDark(dark: boolean) {
  try {
    window.localStorage.setItem(KEY, dark ? "1" : "0");
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
  }
  window.dispatchEvent(new Event(EVENT));
}

type Setter = boolean | ((prev: boolean) => boolean);

export function useDark(): [boolean, (v: Setter) => void] {
  const [dark, setDarkState] = useState(false);

  useEffect(() => {
    const cur = getStoredDark();
    setDarkState(cur);
    document.documentElement.classList.toggle("dark", cur);
    const sync = () => setDarkState(getStoredDark());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync); // other tabs
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setDark = useCallback((v: Setter) => {
    setDarkState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      setStoredDark(next);
      return next;
    });
  }, []);

  return [dark, setDark];
}
