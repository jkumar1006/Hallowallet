"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isSpooky, setIsSpooky] = useState(false);

  useEffect(() => {
    // Check if theme preference is saved
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "halloween") {
      setIsSpooky(true);
      document.documentElement.classList.add("halloween-theme");
    }
  }, []);

  const toggleTheme = () => {
    if (isSpooky) {
      // Switch to normal mode
      document.documentElement.classList.remove("halloween-theme");
      localStorage.setItem("theme", "normal");
      setIsSpooky(false);
    } else {
      // Switch to spooky mode
      document.documentElement.classList.add("halloween-theme");
      localStorage.setItem("theme", "halloween");
      setIsSpooky(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl"
      style={{
        background: isSpooky
          ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: isSpooky
          ? "0 4px 20px rgba(249, 115, 22, 0.4)"
          : "0 4px 20px rgba(102, 126, 234, 0.4)",
      }}
      title={isSpooky ? "Switch to Normal Mode" : "Switch to Spooky Mode"}
    >
      {isSpooky ? "🌙" : "🎨"}
    </button>
  );
}
