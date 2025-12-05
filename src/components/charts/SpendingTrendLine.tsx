type Expense = { date: string; amount: number };

export default function SpendingTrendLine({ expenses }: { expenses: Expense[] }) {
  if (!expenses.length)
    return <div className="text-xs text-slate-600">No data yet.</div>;

  const byDay: Record<number, number> = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    const day = d.getDate();
    byDay[day] = (byDay[day] || 0) + e.amount;
  });

  const points = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b)
    .map((day, i, arr) => {
      const x = (i / Math.max(arr.length - 1, 1)) * 100;
      const max = Math.max(...Object.values(byDay));
      const y = 40 - (byDay[day] / (max || 1)) * 30 - 5;
      return { x, y };
  });

  return (
    <svg viewBox="0 0 100 40" className="w-full h-24">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        points={points.map(p => `${p.x},${p.y}`).join(" ")}
      />
    </svg>
  );
}
