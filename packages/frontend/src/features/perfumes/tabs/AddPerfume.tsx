import { PerfumeForm } from "../components/PerfumeForm";
import { useCreatePerfume } from "../hooks/useCreatePerfume";

interface AddPerfumeProps {
  isAdmin: boolean;
}

export function AddPerfume({ isAdmin }: AddPerfumeProps) {
  const { createPerfume, creating } = useCreatePerfume();

  return (
    <PerfumeForm
      isAdmin={isAdmin}
      onSubmit={createPerfume}
      isSubmitting={creating}
    />
  );
}
