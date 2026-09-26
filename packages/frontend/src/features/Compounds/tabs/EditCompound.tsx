import toast from "react-hot-toast";

import { Spinner } from "../../../ui/Spinner";
import { CompoundForm } from "../components/CompoundForm";

import { useGetCompound } from "../hooks/useCompoundId";
import { useUpdateCompound } from "../hooks/useUpdateCompound";

import type { UpdateCompound } from "../types";

export function EditCompoundTab({ compoundId }: { compoundId: number }) {
  const { perfumeCompound, loading } = useGetCompound(compoundId);
  const { updateCompound, updatingCompound } = useUpdateCompound();

  if (loading) return <Spinner />;

  if (!perfumeCompound) {
    toast.error(`Cannot get compound with id: ${compoundId}`);
    return null;
  }

  const {
    perfumeName,
    companyName,
    perfumeId,
    companyId,
    density,
    countryCode,
  } = perfumeCompound;

  const initialData = {
    perfume: {
      id: perfumeId,
      name: perfumeName,
      paired: true,
    },
    company: {
      id: companyId,
      name: companyName,
      countryCode: countryCode,
      paired: true,
    },
    density: density,
  };

  function handleUpdate(updates: UpdateCompound) {
    updateCompound({ id: compoundId, updates: { density: updates?.density } });

    toast.success(`${perfumeName} by ${companyName} was updated successfully.`);
  }

  return (
    <CompoundForm
      initialData={initialData}
      onSubmit={handleUpdate}
      submitting={updatingCompound}
    />
  );
}
