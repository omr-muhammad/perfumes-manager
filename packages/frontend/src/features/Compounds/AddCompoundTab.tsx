import { CompoundForm } from "./CompoundForm";
import { useCreateCompound } from "./hooks";

export function AddCompoundTab() {
  const { createCompound, creatingCompound } = useCreateCompound();

  return (
    <CompoundForm onSubmit={createCompound} submitting={creatingCompound} />
  );
}
