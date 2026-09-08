import { CoForm } from "./CoForm";
import { useCreateCompany } from "./hooks";

export function AddTab() {
  const { createCo, creating } = useCreateCompany();

  return <CoForm isAdmin={true} isSubmitting={creating} onSubmit={createCo} />;
}
