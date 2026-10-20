"use client";

import { useState, useEffect, useCallback } from "react";

// Shared language state that PERSISTS across page navigations.
// The chosen language is stored in localStorage and broadcast to every
// mounted page/component, so switching AR/EN on one page keeps that choice
// everywhere (fixes the language resetting when navigating between pages).

export type Lang = "ar" | "en";

const KEY = "ui-lang";
const EVENT = "ui-lang-change";

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "ar";
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "en" || v === "ar") return v;
  } catch {}
  return "ar";
}

export function setStoredLang(lang: Lang) {
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

type LangSetter = Lang | ((prev: Lang) => Lang);

// Drop-in replacement for `useState<Lang>("ar")` — accepts a value OR an updater fn.
export function useLang(): [Lang, (l: LangSetter) => void] {
  const [lang, setLangState] = useState<Lang>("ar");

  useEffect(() => {
    // Read the persisted choice on mount (SSR starts at "ar" to avoid hydration mismatch).
    setLangState(getStoredLang());
    const sync = () => setLangState(getStoredLang());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync); // other tabs
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const setLang = useCallback((l: LangSetter) => {
    setLangState((prev) => {
      const next = typeof l === "function" ? l(prev) : l;
      setStoredLang(next);
      return next;
    });
  }, []);

  return [lang, setLang];
}
