import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export async function GET(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const month = searchParams.get("month");
  const format = searchParams.get("format") || "csv";

  // Get all expenses for the user
  let expenses = db.listExpenses(user.id);
  
  // Filter by date range if provided
  if (start && end) {
    expenses = expenses.filter(e => {
      const expenseMonth = e.date.slice(0, 7); // YYYY-MM
      return expenseMonth >= start && expenseMonth <= end;
    });
  } else if (month) {
    expenses = expenses.filter(e => e.date.startsWith(month));
  }

  // Sort by date
  expenses.sort((a, b) => a.date.localeCompare(b.date));

  if (format === "csv") {
    const rows = [
      ["Date", "Description", "Category", "Merchant", "Amount", "Notes"],
      ...expenses.map(e => [
        e.date,
        e.description,
        e.category,
        e.merchant || "",
        e.amount.toFixed(2),
        e.notes || ""
      ])
    ];
    
    const csv = rows.map(r => r.map(v => `"${(v || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hallowallet-report-${start || month || 'all'}.csv"`
      }
    });
  }

  if (format === "pdf") {
    // Simple HTML-based PDF (browser will handle print-to-PDF)
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HalloWallet Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
    .header { margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💰 HalloWallet Expense Report</h1>
    <p><strong>Period:</strong> ${start || month || 'All time'} ${end && start !== end ? `to ${end}` : ''}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Merchant</th>
        <th>Amount</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${expenses.map(e => `
        <tr>
          <td>${e.date}</td>
          <td>${e.description}</td>
          <td>${e.category}</td>
          <td>${e.merchant || '-'}</td>
          <td>$${e.amount.toFixed(2)}</td>
          <td>${e.notes || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="total">
    <p>Total Expenses: $${total.toFixed(2)}</p>
    <p>Number of Transactions: ${expenses.length}</p>
  </div>
  
  <script>
    window.onload = () => window.print();
  </script>
</body>
</html>`;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  }

  // Fallback
  return NextResponse.json({ error: "Invalid format" }, { status: 400 });
}
