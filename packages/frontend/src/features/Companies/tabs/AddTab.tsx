import { CoForm } from "../components/CoForm";
import { useCreateCompany } from "../hooks/useCreateCompany";

export function AddTab() {
  const { createCo, creating } = useCreateCompany();

  return <CoForm isAdmin={true} isSubmitting={creating} onSubmit={createCo} />;
}
