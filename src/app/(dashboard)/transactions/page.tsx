"use client";

import { useLanguage } from "../../../contexts/LanguageContext";
import TransactionTable from "../../../components/transactions/TransactionTable";

export default function TransactionsPage() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("nav.transactions")}</h2>
      <TransactionTable />
    </div>
  );
}
