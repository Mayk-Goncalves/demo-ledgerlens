import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { BarcodeStamp } from "@/components/ui/BarcodeStamp";
import { InputLabel } from "@/components/ui/InputLabel";
import { ReceiptDivider } from "@/components/ui/ReceiptDivider";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type CategoryOption,
} from "@/constants/categories";
import { LocationPicker } from "@/features/transactions/components/LocationPicker";
import { PhotoPicker } from "@/features/transactions/components/PhotoPicker";
import { TransactionDateTimePicker } from "@/features/transactions/components/TransactionDateTimePicker";
import type {
  TransactionCategory,
  TransactionLocation,
} from "@/types/transaction";

// ---------------------------------------------------------------------------
// Variant configuration
// ---------------------------------------------------------------------------

export type FormVariant = "income" | "expense";

/** Max categories before switching from single-row to wrapping grid. */
const MAX_ROW_CATEGORIES = 4;

interface VariantConfig {
  readonly badgeLabel: string;
  readonly badgeBg: string;
  readonly badgeText: string;
  readonly categories: readonly CategoryOption[];
  readonly defaultCategory: TransactionCategory;
  readonly selectedBg: string;
  readonly selectedIconColor: string;
  readonly selectedText: string;
  readonly descriptionPlaceholder: string;
  readonly notePlaceholder: string;
  readonly saveLabel: string;
  readonly saveBg: string;
}

const VARIANTS: Record<FormVariant, VariantConfig> = {
  income: {
    badgeLabel: "INCOME",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-600",
    categories: INCOME_CATEGORIES,
    defaultCategory: "salary",
    selectedBg: "bg-emerald-50 border border-emerald-400",
    selectedIconColor: "#059669",
    selectedText: "text-emerald-700",
    descriptionPlaceholder: "e.g. Salary",
    notePlaceholder: "e.g. March paycheck",
    saveLabel: "Save Income",
    saveBg: "bg-emerald-600 active:bg-emerald-700",
  },
  expense: {
    badgeLabel: "EXPENSE",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-600",
    categories: EXPENSE_CATEGORIES,
    defaultCategory: "food",
    selectedBg: "bg-rose-50 border border-rose-400",
    selectedIconColor: "#e11d48",
    selectedText: "text-rose-700",
    descriptionPlaceholder: "e.g. Grocery shopping",
    notePlaceholder: "e.g. Weekly groceries",
    saveLabel: "Save Expense",
    saveBg: "bg-rose-600 active:bg-rose-700",
  },
};

// ---------------------------------------------------------------------------
// Shared types & helpers
// ---------------------------------------------------------------------------

export interface TransactionFormData {
  readonly amountCents: number;
  readonly category: TransactionCategory;
  readonly description: string;
  readonly note: string;
  readonly timestamp: number;
  readonly receiptUri?: string;
  readonly location?: TransactionLocation;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface TransactionFormModalProps {
  readonly variant: FormVariant;
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: TransactionFormData) => void;
}

export function TransactionFormModal({
  variant,
  visible,
  onClose,
  onSave,
}: TransactionFormModalProps) {
  const config = VARIANTS[variant];
  const useWrapLayout = config.categories.length > MAX_ROW_CATEGORIES;

  const [rawDigits, setRawDigits] = useState("");
  const [category, setCategory] = useState<TransactionCategory>(
    config.defaultCategory,
  );
  const [description, setDescription] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date());
  const [receiptUri, setReceiptUri] = useState<string | undefined>();
  const [location, setLocation] = useState<TransactionLocation | undefined>();
  const amountRef = useRef<TextInput>(null);

  /** Format raw digit string as currency display: "100055" → "1,000.55" */
  const formatCentsDisplay = useCallback((digits: string): string => {
    if (digits.length === 0) return "";
    const cents = parseInt(digits, 10);
    return (cents / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    const trimmed = digits.replace(/^0+/, "") || "";
    setRawDigits(trimmed);
  }, []);

  const displayAmount = formatCentsDisplay(rawDigits);

  const reset = useCallback(() => {
    setRawDigits("");
    setCategory(config.defaultCategory);
    setDescription("");
    setNote("");
    setDate(new Date());
    setReceiptUri(undefined);
    setLocation(undefined);
  }, [config.defaultCategory]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSave = useCallback(() => {
    const amountCents = parseInt(rawDigits, 10);
    if (!amountCents || amountCents <= 0) return;

    onSave({
      amountCents,
      category,
      description: description.trim(),
      note: note.trim(),
      timestamp: date.getTime(),
      receiptUri,
      location,
    });
    reset();
  }, [
    rawDigits,
    category,
    description,
    note,
    date,
    receiptUri,
    location,
    onSave,
    reset,
  ]);

  const isValid = rawDigits.length > 0 && parseInt(rawDigits, 10) > 0;

  const { height: screenHeight } = useWindowDimensions();
  const sheetMaxHeight = screenHeight * 0.85;

  const animation = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 9,
        tension: 65,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible, animation]);

  const backdropOpacity = animation;
  const sheetTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        {/* Animated blur + overlay backdrop */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        >
          <BlurView
            intensity={10}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.overlay} />
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.root} onPress={handleClose} />

          <Animated.View
            style={{
              maxHeight: sheetMaxHeight,
              transform: [{ translateY: sheetTranslateY }],
            }}
            className="pt-4 bg-gray-100 dark:bg-gray-800 rounded-t-3xl"
          >
            {/* Close button — also blocks taps from reaching dismiss layer */}
            <View
              className="flex-row justify-end px-4 pb-1"
              onStartShouldSetResponder={() => true}
            >
              <Pressable onPress={handleClose} hitSlop={12}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#6b7280"
                />
              </Pressable>
            </View>

            <ScrollView
              className="px-5"
              contentContainerClassName="pb-8"
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={Keyboard.dismiss}
            >
              {/* Receipt card */}
              <View className="px-6 pt-6 pb-5 bg-white rounded-lg shadow-sm">
                {/* Receipt header */}
                <View className="items-center">
                  <Text className="text-sm">
                    <Text className="font-bold text-gray-700">Ledger</Text>
                    <Text className="font-light text-emerald-600">Lens</Text>
                  </Text>
                  <View
                    className={`px-4 py-1 mt-2 rounded-full ${config.badgeBg}`}
                  >
                    <Text
                      className={`text-xs font-semibold tracking-wider ${config.badgeText}`}
                    >
                      {config.badgeLabel}
                    </Text>
                  </View>
                </View>

                <ReceiptDivider />

                {/* Description */}
                <View>
                  <InputLabel>DESCRIPTION</InputLabel>
                  <TextInput
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900"
                    placeholder={config.descriptionPlaceholder}
                    placeholderTextColor="#9ca3af"
                    value={description}
                    onChangeText={setDescription}
                    maxLength={100}
                  />
                </View>

                <ReceiptDivider />

                {/* Amount */}
                <View>
                  <InputLabel>AMOUNT</InputLabel>
                  <Pressable
                    className="flex-row items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                    onPress={() => {
                      const input = amountRef.current;
                      if (!input) return;
                      input.blur();
                      requestAnimationFrame(() => input.focus());
                    }}
                  >
                    <Text
                      className={`text-sm ${displayAmount ? "text-gray-900" : "text-gray-400"}`}
                    >
                      $ {displayAmount || "0.00"}
                    </Text>
                    <TextInput
                      ref={amountRef}
                      style={styles.hiddenInput}
                      keyboardType="number-pad"
                      value={rawDigits}
                      onChangeText={handleAmountChange}
                      caretHidden
                    />
                  </Pressable>
                </View>

                <ReceiptDivider />

                {/* Date & Time */}
                <TransactionDateTimePicker value={date} onChange={setDate} />

                <ReceiptDivider />

                {/* Category */}
                <View>
                  <InputLabel className="mb-3">CATEGORY</InputLabel>
                  <View
                    className={`flex-row gap-2 ${useWrapLayout ? "flex-wrap" : ""}`}
                  >
                    {config.categories.map((cat) => {
                      const selected = category === cat.value;
                      return (
                        <Pressable
                          key={cat.value}
                          onPress={() => setCategory(cat.value)}
                          className={`items-center gap-1.5 rounded-lg py-3 ${
                            useWrapLayout ? "px-3" : "flex-1"
                          } ${
                            selected
                              ? config.selectedBg
                              : "bg-gray-50 border border-gray-200"
                          }`}
                          style={useWrapLayout ? { width: "30%" } : undefined}
                        >
                          <MaterialCommunityIcons
                            name={cat.icon}
                            size={20}
                            color={
                              selected ? config.selectedIconColor : "#9ca3af"
                            }
                          />
                          <Text
                            className={`text-xs font-medium ${
                              selected ? config.selectedText : "text-gray-500"
                            }`}
                          >
                            {cat.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <ReceiptDivider />

                {/* Note */}
                <View>
                  <InputLabel>NOTE</InputLabel>
                  <TextInput
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900"
                    placeholder={config.notePlaceholder}
                    placeholderTextColor="#9ca3af"
                    value={note}
                    onChangeText={setNote}
                    maxLength={200}
                  />
                </View>

                <ReceiptDivider />

                {/* Location */}
                <View>
                  <InputLabel>LOCATION</InputLabel>
                  <LocationPicker value={location} onChange={setLocation} />
                </View>

                <ReceiptDivider />

                {/* Receipt photo */}
                <View>
                  <InputLabel>RECEIPT</InputLabel>
                  <PhotoPicker value={receiptUri} onChange={setReceiptUri} />
                </View>

                <ReceiptDivider />

                {/* Receipt footer */}
                <View className="items-center gap-2">
                  <BarcodeStamp />
                  <Text className="text-xs text-gray-300">★ Thank you ★</Text>
                </View>
              </View>

              {/* Save button */}
              <View className="px-1 mt-5">
                <Pressable
                  onPress={handleSave}
                  disabled={!isValid}
                  className={`flex-row items-center justify-center gap-2 rounded-xl py-4 ${
                    isValid ? config.saveBg : "bg-gray-300"
                  }`}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={20}
                    color={isValid ? "#ffffff" : "#9ca3af"}
                  />
                  <Text
                    className={`text-base font-semibold ${
                      isValid ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {config.saveLabel}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
});
