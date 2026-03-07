import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";

import { AddTransactionFAB } from "@/components/ui/AddTransactionFAB";
import { BalanceCard } from "@/components/ui/BalanceCard";
import { Header } from "@/components/ui/Header";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { TransactionList } from "@/features/transactions/TransactionList";
import { initDatabase } from "@/lib/database";
import { useFinanceStore } from "@/stores/finance";
import type { TransactionType } from "@/types/transaction";

export default function Home() {
  const [cardBleed, setCardBleed] = useState(0);

  const { year, month, transactions, summary, loading, reload, setMonth } =
    useFinanceStore();

  useEffect(() => {
    initDatabase().then(() => reload());
  }, [reload]);

  const handleBleedMeasured = useCallback((bleed: number) => {
    setCardBleed(bleed);
  }, []);

  const handlePrevMonth = useCallback(() => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    setMonth(prevYear, prevMonth);
  }, [year, month, setMonth]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    setMonth(nextYear, nextMonth);
  }, [year, month, setMonth]);

  const handleResetMonth = useCallback(() => {
    const now = new Date();
    setMonth(now.getFullYear(), now.getMonth() + 1);
  }, [setMonth]);

  const handleAddTransaction = useCallback((type: TransactionType) => {
    // TODO: navigate to add-transaction form
    Alert.alert("Add Transaction", `Type: ${type}`);
  }, []);

  return (
    <View className="flex-1 bg-gray-900">
      <Header bottomPadding={cardBleed}>
        <MonthPicker
          year={year}
          month={month}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          onReset={handleResetMonth}
        />
      </Header>

      <View className="flex-1 p-6 rounded-t-3xl bg-gray-50">
        <BalanceCard
          balanceCents={summary.balance}
          incomeCents={summary.income}
          expensesCents={summary.expenses}
          creditCardCents={summary.creditCard}
          onBleedMeasured={handleBleedMeasured}
        />

        <TransactionList transactions={transactions} loading={loading} />
      </View>

      <AddTransactionFAB onSelect={handleAddTransaction} />
    </View>
  );
}
