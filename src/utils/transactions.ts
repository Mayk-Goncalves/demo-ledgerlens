import type { Transaction } from "@/types/transaction";

import { formatDayLabel } from "./date";

export interface DayGroup {
  readonly label: string;
  readonly transactions: readonly Transaction[];
}

/** Group transactions by calendar day, sorted most-recent-first. */
export function groupByDay(
  transactions: readonly Transaction[],
): readonly DayGroup[] {
  const sorted = [...transactions].sort((a, b) => b.createdAt - a.createdAt);
  const today = new Date();
  const groups: DayGroup[] = [];
  let currentKey = "";
  let currentBucket: Transaction[] = [];

  for (const tx of sorted) {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    if (key !== currentKey) {
      if (currentBucket.length > 0) {
        groups.push({
          label: formatDayLabel(new Date(currentBucket[0].createdAt), today),
          transactions: currentBucket,
        });
      }
      currentKey = key;
      currentBucket = [tx];
    } else {
      currentBucket.push(tx);
    }
  }

  if (currentBucket.length > 0) {
    groups.push({
      label: formatDayLabel(new Date(currentBucket[0].createdAt), today),
      transactions: currentBucket,
    });
  }

  return groups;
}
