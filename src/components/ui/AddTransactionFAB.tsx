import { useCallback, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import type { TransactionType } from "@/types/transaction";

const ACTIONS: readonly {
  type: TransactionType;
  label: string;
  icon: string;
}[] = [
  { type: "credit_card", label: "Credit Card", icon: "💳" },
  { type: "expense", label: "Expense", icon: "💸" },
  { type: "income", label: "Income", icon: "💰" },
];

const ANIMATION_DURATION = 200;

interface AddTransactionFABProps {
  readonly onSelect: (type: TransactionType) => void;
}

/**
 * Floating action button that expands upward to reveal transaction type options.
 * Uses Animated for a smooth scale/fade with no extra dependencies.
 */
export function AddTransactionFAB({ onSelect }: AddTransactionFABProps) {
  const [expanded, setExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const collapse = useCallback(() => {
    setExpanded(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [animation]);

  const toggle = useCallback(() => {
    if (expanded) {
      collapse();
    } else {
      setExpanded(true);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
      }).start();
    }
  }, [expanded, animation, collapse]);

  const handleSelect = useCallback(
    (type: TransactionType) => {
      // Collapse first, then notify parent
      setExpanded(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start(() => onSelect(type));
    },
    [animation, onSelect],
  );

  // Rotate the "+" icon 45° to form an "×" when expanded
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Main FAB dimensions
  const FAB_SIZE = 56;
  const ACTION_SIZE = 48;
  // Offset so action circle right edge aligns with FAB right edge
  const ACTION_RIGHT = (FAB_SIZE - ACTION_SIZE) / 2;
  // Extra gap between the main FAB and the first action button
  const FIRST_ACTION_GAP = 16;
  const ACTION_SPACING = 60;

  // Animate FAB background: emerald-600 → gray-500
  const fabBg = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#059669", "#6b7280"],
  });

  return (
    <>
      {/* Full-screen backdrop to dismiss on tap outside */}
      {expanded && (
        <Pressable
          onPress={collapse}
          style={StyleSheet.absoluteFill}
          accessibilityLabel="Close menu"
        />
      )}

      <View className="absolute right-6 bottom-8">
        {/* Action options — animated upward from the main FAB */}
        {ACTIONS.map((action, index) => {
          const translateY = animation.interpolate({
            inputRange: [0, 1],
            outputRange: [
              0,
              -(FIRST_ACTION_GAP + index * ACTION_SPACING + ACTION_SPACING),
            ],
          });
          const opacity = animation;

          return (
            <Animated.View
              key={action.type}
              style={{
                position: "absolute",
                right: ACTION_RIGHT,
                bottom: 0,
                flexDirection: "row-reverse",
                alignItems: "center",
                transform: [{ translateY }],
                opacity,
              }}
            >
              <Pressable
                onPress={() => handleSelect(action.type)}
                style={{ width: ACTION_SIZE, height: ACTION_SIZE }}
                className="items-center justify-center rounded-full bg-emerald-600 shadow-lg active:bg-emerald-700"
              >
                <Text className="text-lg">{action.icon}</Text>
              </Pressable>
              <View className="mr-2 rounded-lg bg-gray-800 px-3 py-1.5">
                <Text className="text-xs font-medium text-white">
                  {action.label}
                </Text>
              </View>
            </Animated.View>
          );
        })}

        {/* Main FAB */}
        <Animated.View
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            borderRadius: FAB_SIZE / 2,
            backgroundColor: fabBg,
          }}
          className="items-center justify-center shadow-lg"
        >
          <Pressable
            onPress={toggle}
            className="flex-1 w-full items-center justify-center"
          >
            <Animated.Text
              className="text-2xl font-light text-white"
              style={{ transform: [{ rotate: rotation }] }}
            >
              +
            </Animated.Text>
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
}
