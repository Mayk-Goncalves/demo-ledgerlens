import {
  TransactionFormModal,
  type TransactionFormData,
} from "./TransactionFormModal";

interface AddExpenseModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: TransactionFormData) => void;
}

export function AddExpenseModal(props: AddExpenseModalProps) {
  return <TransactionFormModal {...props} variant="expense" />;
}
