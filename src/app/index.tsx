import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { resetDatabase } from "@/lib/database";

export default function Index() {
  const router = useRouter();

  async function handleGetStarted() {
    await resetDatabase();
    router.replace("/(tabs)");
  }

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <View className="flex-row items-start">
        <Text className="text-5xl">
          <Text className="text-emerald-600 font-bold">Ledger</Text>
          <Text className="text-gray-900 font-light">Lens</Text>
        </Text>
        <Text className="text-xs text-emerald-600 mt-1 ml-0.5">®</Text>
      </View>
      <Text className="mt-3 text-base text-gray-400">
        Your personal finance companion
      </Text>

      <Pressable
        onPress={handleGetStarted}
        className="mt-10 rounded-full bg-emerald-600 px-10 py-3 active:bg-emerald-700"
      >
        <Text className="text-base font-semibold text-white">Get Started</Text>
      </Pressable>

      <Text className="absolute bottom-10 text-sm text-gray-300">
        Portfolio demo project — not a real financial product
      </Text>
    </View>
  );
}
