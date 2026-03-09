import { Text } from "react-native";

interface InputLabelProps {
  /** The label text (rendered uppercase automatically). */
  readonly children: string;
  /** Extra bottom margin, e.g. "mb-3" for category pills. Defaults to "mb-2". */
  readonly className?: string;
}

/** Consistent receipt-style label used above form inputs. */
export function InputLabel({ children, className }: InputLabelProps) {
  return (
    <Text
      className={`${className ?? "mb-2"} text-xs tracking-widest text-gray-400`}
    >
      {children}
    </Text>
  );
}
