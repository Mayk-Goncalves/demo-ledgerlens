import { MaterialCommunityIcons } from "@expo/vector-icons";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { InputLabel } from "@/components/ui/InputLabel";

type PickerMode = "date" | "time";

interface TransactionDateTimePickerProps {
  /** The currently selected date/time. */
  readonly value: Date;
  /** Called when the user confirms a new date or time. */
  readonly onChange: (date: Date) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Reusable date + time picker for transaction forms.
 * Renders two tappable chips (date + time) that open the native picker.
 */
export function TransactionDateTimePicker({
  value,
  onChange,
}: TransactionDateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<PickerMode>("date");

  const openPicker = useCallback((mode: PickerMode) => {
    setPickerMode(mode);
    setShowPicker(true);
  }, []);

  const handleChange = useCallback(
    (_event: unknown, selected?: Date) => {
      if (Platform.OS === "android") {
        setShowPicker(false);
      }
      if (selected) {
        onChange(selected);
      }
    },
    [onChange],
  );

  const handleDismiss = useCallback(() => {
    setShowPicker(false);
  }, []);

  return (
    <View>
      <InputLabel>DATE & TIME</InputLabel>
      <View className="flex-row gap-2">
        <Pressable
          onPress={() => openPicker("date")}
          className="flex-1 flex-row items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
        >
          <MaterialCommunityIcons
            name="calendar-outline"
            size={16}
            color="#9ca3af"
          />
          <Text className="text-sm text-gray-900">{formatDate(value)}</Text>
        </Pressable>

        <Pressable
          onPress={() => openPicker("time")}
          className="flex-row items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={16}
            color="#9ca3af"
          />
          <Text className="text-sm text-gray-900">{formatTime(value)}</Text>
        </Pressable>
      </View>

      {showPicker && (
        <RNDateTimePicker
          value={value}
          mode={pickerMode}
          display="default"
          maximumDate={new Date()}
          onChange={handleChange}
          onTouchCancel={handleDismiss}
        />
      )}
    </View>
  );
}
