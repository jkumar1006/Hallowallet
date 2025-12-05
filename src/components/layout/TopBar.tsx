"use client";

import { useEffect, useState, useRef } from "react";
import SpookyToggle from "./SpookyToggle";
import LanguageSelector from "../ui/LanguageSelector";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TopBar() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d) {
          setName(d.name || "");
          setEmail(d.email || "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b hw-border bg-slate-950/95">
      <div>
        <div className="text-xs text-slate-500">{t("dashboard.welcomeBack")}</div>
        <div className="font-semibold">{t("common.appName")} {t("nav.dashboard")}</div>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSelector />
        <SpookyToggle />
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hw-btn-secondary"
        >
          Hero View
        </button>
        
        {/* Account Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white hover:scale-110 transition-all shadow-lg"
            title={name || "Account"}
          >
            {(name || "U")[0].toUpperCase()}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                    {(name || "U")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{name || "User"}</div>
                    <div className="text-xs text-slate-400 truncate">{email || "user@example.com"}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
