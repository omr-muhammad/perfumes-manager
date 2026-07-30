import { Spinner } from "../../ui/Spinner";
import { useEditPerfume, usePerfumeById } from "./hook";
import { PerfumeForm, type FormPerfume } from "./PerfumeForm";

interface EditPerfumeTabProps {
  perfumeId: number;
  isAdmin: boolean;
}

export function EditPerfumeTab({ perfumeId, isAdmin }: EditPerfumeTabProps) {
  const { perfume, loading } = usePerfumeById(perfumeId);
  const { updatePerfume, updating } = useEditPerfume();

  if (loading) return <Spinner />;

  const initialData: FormPerfume = {
    name: perfume!.perfume.name,
    sex: perfume!.perfume.sex,
    seasons: perfume!.perfume.seasons,
    descriptionEn: perfume!.perfume.descriptionEn,
    descriptionAr: perfume!.perfume.descriptionAr ?? "لا يوجد وصف بالعربية",
  };

  function handleEditPerfume(current: FormPerfume) {
    updatePerfume({ perfumeId, updates: current });
  }

  return (
    <PerfumeForm
      initialData={initialData}
      onSubmit={handleEditPerfume}
      isAdmin={isAdmin}
      isSubmitting={updating}
      perfumeId={perfumeId}
      approved={perfume!.perfume.approved}
    />
  );
}
