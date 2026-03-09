import type { MaterialCommunityIcons } from "@expo/vector-icons";

import type { TransactionCategory } from "@/types/transaction";

export interface CategoryOption {
  readonly value: TransactionCategory;
  readonly label: string;
  readonly icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}

export const INCOME_CATEGORIES: readonly CategoryOption[] = [
  { value: "salary", label: "Salary", icon: "cash" },
  { value: "freelance", label: "Freelance", icon: "laptop" },
  { value: "other", label: "Other", icon: "dots-horizontal-circle-outline" },
];

export const EXPENSE_CATEGORIES: readonly CategoryOption[] = [
  { value: "food", label: "Food", icon: "food" },
  { value: "transport", label: "Transport", icon: "bus" },
  { value: "housing", label: "Housing", icon: "home-outline" },
  { value: "utilities", label: "Utilities", icon: "lightning-bolt-outline" },
  { value: "entertainment", label: "Fun", icon: "gamepad-variant-outline" },
  { value: "health", label: "Health", icon: "heart-pulse" },
  { value: "shopping", label: "Shopping", icon: "shopping-outline" },
  { value: "education", label: "Education", icon: "school-outline" },
  { value: "other", label: "Other", icon: "dots-horizontal-circle-outline" },
];
