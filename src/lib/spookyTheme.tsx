"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type SpookyContextType = {
  spooky: boolean;
  setSpooky: (v: boolean) => void;
};

const SpookyContext = createContext<SpookyContextType | null>(null);

export function SpookyProvider({ children }: { children: ReactNode }) {
  const [spooky, setSpooky] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem("hallowallet-theme");
    if (stored) setSpooky(stored === "halloween");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      window.localStorage.setItem("hallowallet-theme", spooky ? "halloween" : "normal");
    }
  }, [spooky, mounted]);

  return (
    <SpookyContext.Provider value={{ spooky, setSpooky }}>
      <div className={spooky && mounted ? "halloween-theme min-h-screen text-slate-50" : "min-h-screen bg-slate-950 text-slate-50"}>
        {children}
      </div>
    </SpookyContext.Provider>
  );
}

export function useSpooky() {
  const ctx = useContext(SpookyContext);
  if (!ctx) throw new Error("useSpooky must be used within SpookyProvider");
  return ctx;
}
