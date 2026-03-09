import {
  TransactionFormModal,
  type TransactionFormData,
} from "./TransactionFormModal";

interface AddIncomeModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSave: (data: TransactionFormData) => void;
}

export function AddIncomeModal(props: AddIncomeModalProps) {
  return <TransactionFormModal {...props} variant="income" />;
}
