"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

const categories = ["All", "Food", "Transit", "Bills", "Subscriptions", "Other"];

export default function CategoryFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = params.get("cat") || "All";

  function setCat(cat: string) {
    const next = new URLSearchParams(params.toString());
    next.set("cat", cat);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map(c => (
        <button
          key={c}
          onClick={() => setCat(c)}
          className={clsx(
            "px-2 py-1 rounded-full text-[10px] border",
            current === c
              ? "bg-slate-100 text-black border-slate-100"
              : "bg-slate-950 text-slate-400 border-slate-700 hover:bg-slate-900 hover:text-white"
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
