import { StyleSheet, Text, View } from "react-native";

/**
 * Barcode encoding loosely based on EAN-13 bar patterns.
 * Each number maps to a sequence of bar/space widths (1–4 units).
 * The pattern alternates bar → space → bar → space.
 */
const ENCODINGS: readonly (readonly number[])[] = [
  [3, 2, 1, 1], // 0
  [2, 2, 2, 1], // 1
  [2, 1, 2, 2], // 2
  [1, 4, 1, 1], // 3
  [1, 1, 3, 2], // 4
  [1, 2, 3, 1], // 5
  [1, 1, 1, 4], // 6
  [1, 3, 1, 2], // 7
  [1, 2, 1, 3], // 8
  [3, 1, 1, 2], // 9
];

/** Guard bars (start / end). */
const GUARD = [1, 1, 1] as const;
/** Center guard pattern. */
const CENTER_GUARD = [1, 1, 1, 1, 1] as const;

/** Deterministic digit sequence that looks arbitrary. */
const DIGITS = [4, 9, 1, 0, 7, 3, 8, 2, 5, 6, 1, 3] as const;

/** Build a full barcode as alternating bar (true) / space (false) width pairs. */
function buildBarPattern(): readonly { width: number; isBar: boolean }[] {
  const bars: { width: number; isBar: boolean }[] = [];
  let isBar = true;

  const push = (widths: readonly number[]) => {
    for (const w of widths) {
      bars.push({ width: w, isBar });
      isBar = !isBar;
    }
  };

  // Start guard
  push(GUARD);

  // First 6 digits
  for (let i = 0; i < 6; i++) {
    push(ENCODINGS[DIGITS[i]]);
  }

  // Center guard
  push(CENTER_GUARD);

  // Last 6 digits
  for (let i = 6; i < 12; i++) {
    push(ENCODINGS[DIGITS[i]]);
  }

  // End guard
  push(GUARD);

  return bars;
}

const BARCODE_BARS = buildBarPattern();

/** Base unit width in pixels — bars are multiples of this. */
const UNIT = 2;

interface BarcodeStampProps {
  /** Height of the barcode bars. @default 48 */
  readonly height?: number;
}

/**
 * Decorative barcode with centered LedgerLens branding.
 */
export function BarcodeStamp({ height = 48 }: BarcodeStampProps) {
  return (
    <View className="items-center">
      <View className="relative items-center justify-center py-2">
        {/* Barcode bars */}
        <View
          className="flex-row items-center justify-center"
          style={{ height }}
        >
          {BARCODE_BARS.map((bar, i) => (
            <View
              key={i}
              style={{
                width: bar.width * UNIT,
                height: "100%",
                opacity: bar.isBar ? 0.2 : 0,
              }}
              className="bg-gray-900"
            />
          ))}
        </View>
        {/* Branded text overlay */}
        <View
          style={StyleSheet.absoluteFill}
          className="items-center justify-center"
        >
          <Text className="text-2xl text-white">LedgerLens</Text>
        </View>
      </View>
    </View>
  );
}
