"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import MonthSelector from "./MonthSelector";
import SpookyToggle from "./SpookyToggle";
import { useLanguage } from "../../contexts/LanguageContext";
import clsx from "clsx";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  // Memoize query string to prevent unnecessary re-renders
  const queryString = useMemo(() => {
    const params = searchParams.toString();
    return params ? `?${params}` : '';
  }, [searchParams]);

  const nav = [
    { 
      href: `/dashboard${queryString}`, 
      label: t("nav.dashboard"), 
      icon: "🏠", 
      basePath: "/dashboard",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      href: `/transactions${queryString}`, 
      label: t("nav.transactions"), 
      icon: "📓", 
      basePath: "/transactions",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      href: `/insights${queryString}`, 
      label: t("nav.insights"), 
      icon: "📊", 
      basePath: "/insights",
      gradient: "from-green-500 to-emerald-500"
    },
    { 
      href: `/goals${queryString}`, 
      label: t("nav.goals"), 
      icon: "🎯", 
      basePath: "/goals",
      gradient: "from-orange-500 to-red-500"
    },
    { 
      href: `/advisor${queryString}`, 
      label: t("nav.advisor"), 
      icon: "💰", 
      basePath: "/advisor",
      gradient: "from-yellow-500 to-orange-500"
    },
    { 
      href: `/reports${queryString}`, 
      label: t("nav.reports"), 
      icon: "📑", 
      basePath: "/reports",
      gradient: "from-indigo-500 to-purple-500"
    },
    { 
      href: `/settings${queryString}`, 
      label: "Savings Tracker", 
      icon: "💰", 
      basePath: "/settings",
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      href: `/help${queryString}`, 
      label: "User Guide", 
      icon: "📖", 
      basePath: "/help",
      gradient: "from-blue-500 to-indigo-600"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Logo/Brand - Fixed at top */}
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="hw-bg-card border hw-border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-2xl smooth-float shadow-lg shadow-orange-500/30">
              👻
            </div>
            <div>
              <div className="font-bold text-lg">{t("common.appName")}</div>
              <div className="text-xs text-slate-400">Smart spooky money</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* Navigation */}
        <nav className="space-y-2 mb-4">
          {nav.map((item, index) => {
          const isActive = pathname === item.basePath;
          return (
            <Link
              key={item.basePath}
              href={item.href}
              prefetch={true}
              scroll={false}
              className={clsx(
                "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer",
                isActive
                  ? "hw-bg-card border hw-border shadow-lg scale-105"
                  : "text-slate-400 hover:text-white hover:scale-105 hover:hw-bg-card hover:border hover:hw-border"
              )}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b ${item.gradient}`} />
              )}
              
              {/* Icon with gradient background */}
              <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all",
                isActive 
                  ? `bg-gradient-to-br ${item.gradient} shadow-lg`
                  : "bg-slate-800/50 group-hover:bg-slate-800"
              )}>
                {item.icon}
              </div>
              
              {/* Label */}
              <span className={clsx(
                "flex-1 transition-colors",
                isActive ? "text-white font-semibold" : ""
              )}>
                {item.label}
              </span>
              
              {/* Arrow indicator for active */}
              {isActive && (
                <span className="text-slate-400">→</span>
              )}
            </Link>
          );
        })}
      </nav>

        {/* Month Selector */}
        <div className="mt-2">
          <MonthSelector />
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 pt-2">
        <SpookyToggle />
      </div>
    </div>
  );
}
