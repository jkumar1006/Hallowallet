"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function MonthSelector() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlMonth = params.get("month") || new Date().toISOString().slice(0, 7);
  const [current, setCurrent] = useState(urlMonth);

  // Sync with URL changes
  useEffect(() => {
    setCurrent(urlMonth);
  }, [urlMonth]);

  // Generate months: past 5 years + current + future 5 years
  const options = useMemo(() => {
    const result: { value: string; label: string }[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Start from 5 years ago
    for (let yearOffset = -5; yearOffset <= 5; yearOffset++) {
      const year = currentYear + yearOffset;
      for (let month = 0; month < 12; month++) {
        const value = `${year}-${String(month + 1).padStart(2, '0')}`;
        const label = `${monthNames[month]} ${year}`;
        result.push({ value, label });
      }
    }
    return result;
  }, []);

  function setMonth(month: string) {
    const next = new URLSearchParams(params.toString());
    next.set("month", month);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-slate-500 uppercase">Month</span>
      <select
        value={current}
        onChange={e => setMonth(e.target.value)}
        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
