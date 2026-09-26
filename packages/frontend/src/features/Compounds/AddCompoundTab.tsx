import { CompoundForm } from "./CompoundForm";
import { useCreateCompound } from "./hooks";

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
