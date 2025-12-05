import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import AssistantPanel from "../../components/layout/AssistantPanel";
import AddExpenseModal from "../../components/modals/AddExpenseModal";
import SubscriptionReminders from "../../components/subscriptions/SubscriptionReminders";
import { getCurrentUser } from "../../lib/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden relative">
      <aside className="w-64 border-r hw-border bg-slate-950/95 hw-bg-card flex-shrink-0 overflow-hidden">
        <Sidebar />
      </aside>
      <section className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">{children}</main>
      </section>
      <aside className="w-80 border-l hw-border bg-slate-950/95 hw-bg-card hidden xl:flex flex-shrink-0 overflow-hidden">
        <AssistantPanel />
      </aside>
      <AddExpenseModal />
      <SubscriptionReminders />
    </div>
  );
}
