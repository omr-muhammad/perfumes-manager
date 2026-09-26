import { CompoundForm } from "../components/CompoundForm";
import { useCreateCompound } from "../hooks/useCreateCompounds";

interface AddTabProps {
  partialData?: any;
}

export function AddCompoundTab({ partialData }: AddTabProps) {
  const { createCompound, creatingCompound } = useCreateCompound();

  return (
    <CompoundForm
      initialData={partialData}
      onSubmit={createCompound}
      submitting={creatingCompound}
    />
  );
}
