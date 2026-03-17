import { useCallback, useMemo } from "react";
import { ScrollView, View } from "react-native";

import { Header } from "@/components/ui/Header";
import { MonthPicker } from "@/components/ui/MonthPicker";
import { InsightsCard } from "@/features/analytics/components/InsightsCard";
import { MonthOverview } from "@/features/analytics/components/MonthOverview";
import { SpendingSummary } from "@/features/analytics/components/SpendingSummary";
import { useFinanceStore } from "@/stores/finance";
import { computeMonthInsights } from "@/utils/analytics";

export default function AnalyticsTab() {
  const { year, month, transactions, summary, setMonth } = useFinanceStore();

  const insights = useMemo(
    () => computeMonthInsights(transactions, year, month),
    [transactions, year, month],
  );

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

  return (
    <View className="flex-1 bg-gray-900 dark:bg-gray-100">
      <Header bottomPadding={16}>
        <MonthPicker
          year={year}
          month={month}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
          onReset={handleResetMonth}
        />
      </Header>

      <View className="flex-1 p-6 rounded-t-3xl bg-gray-50 dark:bg-gray-900">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, gap: 16 }}
        >
          <MonthOverview
            incomeCents={summary.income}
            expensesCents={summary.expenses}
            balanceCents={summary.balance}
          />

          <SpendingSummary
            transactions={transactions}
            totalExpensesCents={summary.expenses}
          />

          <InsightsCard insights={insights} />
        </ScrollView>
      </View>
    </View>
  );
}
