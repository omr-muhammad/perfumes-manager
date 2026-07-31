import { PerfumeForm } from "./PerfumeForm";
import { useAddPerfume } from "./hook";

interface AddPerfumeProps {
  isAdmin: boolean;
}

export function AddPerfumeTab({ isAdmin }: AddPerfumeProps) {
  const { createNewPerfume, creating } = useAddPerfume();

  return (
    <PerfumeForm
      isAdmin={isAdmin}
      onSubmit={createNewPerfume}
      isSubmitting={creating}
    />
  );
}
