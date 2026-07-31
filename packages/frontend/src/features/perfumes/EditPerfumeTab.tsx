import { Spinner } from "../../ui/Spinner";
import { useApprovePerfume, useEditPerfume, usePerfumeById } from "./hook";
import { PerfumeForm, type FormPerfume } from "./PerfumeForm";

interface EditPerfumeTabProps {
  perfumeId: number;
  isAdmin: boolean;
  mode?: "approve";
  backToBrowse: () => void;
}

export function EditPerfumeTab({
  perfumeId,
  isAdmin,
  mode,
  backToBrowse,
}: EditPerfumeTabProps) {
  const { perfume, loading } = usePerfumeById(perfumeId);
  const actionHook = mode === "approve" ? useApprovePerfume : useEditPerfume;
  const { mutate, isPending } = actionHook();

  if (loading) return <Spinner />;

  const initialData: FormPerfume = {
    name: perfume!.perfume.name,
    sex: perfume!.perfume.sex,
    seasons: perfume!.perfume.seasons,
    descriptionEn: perfume!.perfume.descriptionEn,
    descriptionAr: perfume!.perfume.descriptionAr,
  };

  function handleAction(current: FormPerfume) {
    mutate({ perfumeId, updates: current });

    backToBrowse();
  }

  return (
    <PerfumeForm
      initialData={initialData}
      onSubmit={handleAction}
      isAdmin={isAdmin}
      isSubmitting={isPending}
      approve={mode === "approve"}
    />
  );
}
