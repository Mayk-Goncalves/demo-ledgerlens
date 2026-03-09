import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { BalanceCard } from "@/components/ui/BalanceCard";
import { Header } from "@/components/ui/Header";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { AddTransactionFAB } from "@/features/transactions/components/AddTransactionFAB";
import { TransactionList } from "@/features/transactions/components/TransactionList";
import { AddExpenseModal } from "@/features/transactions/modals/AddExpenseModal";
import { AddIncomeModal } from "@/features/transactions/modals/AddIncomeModal";
import { insertTransaction } from "@/features/transactions/storage";
import { initDatabase } from "@/lib/database";
import { useFinanceStore } from "@/stores/finance";
import type {
  TransactionCategory,
  TransactionLocation,
  TransactionType,
} from "@/types/transaction";

export default function Home() {
  const [cardBleed, setCardBleed] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

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

  const handleSaveIncome = useCallback(
    async (data: {
      amountCents: number;
      category: TransactionCategory;
      description: string;
      note: string;
      timestamp: number;
      receiptUri?: string;
      location?: TransactionLocation;
    }) => {
      await insertTransaction({
        type: "income",
        amount: data.amountCents,
        category: data.category,
        note:
          [data.description, data.note].filter(Boolean).join(" — ") ||
          undefined,
        receiptUri: data.receiptUri,
        location: data.location,
        createdAt: data.timestamp,
      });
      await reload();
      setShowIncomeModal(false);
    },
    [reload],
  );

  const handleSaveExpense = useCallback(
    async (data: {
      amountCents: number;
      category: TransactionCategory;
      description: string;
      note: string;
      timestamp: number;
      receiptUri?: string;
      location?: TransactionLocation;
    }) => {
      await insertTransaction({
        type: "expense",
        amount: data.amountCents,
        category: data.category,
        note:
          [data.description, data.note].filter(Boolean).join(" — ") ||
          undefined,
        receiptUri: data.receiptUri,
        location: data.location,
        createdAt: data.timestamp,
      });
      await reload();
      setShowExpenseModal(false);
    },
    [reload],
  );

  const handleAddTransaction = useCallback((type: TransactionType) => {
    switch (type) {
      case "income":
        setShowIncomeModal(true);
        break;
      case "expense":
        setShowExpenseModal(true);
        break;
    }
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
          onBleedMeasured={handleBleedMeasured}
        />

        <TransactionList
          transactions={transactions}
          loading={loading}
          onRefresh={reload}
        />
      </View>

      <AddTransactionFAB onSelect={handleAddTransaction} />

      <AddIncomeModal
        visible={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSave={handleSaveIncome}
      />

      <AddExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={handleSaveExpense}
      />
    </View>
  );
}
