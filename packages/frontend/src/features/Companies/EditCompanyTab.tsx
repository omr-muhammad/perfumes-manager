import type { CoUpdates } from "../../api/companiesAPI";
import { Spinner } from "../../ui/Spinner";
import { CoForm, type FormCompany } from "./CoForm";
import { useApproveCompany, useCompanyById, useUpdateCompany } from "./hooks";

type EditCompanyTabProps = {
  isAdmin: boolean;
  coId: number;
  backToBrowse: () => void;
  mode?: "approve";
};

export function EditCompanyTab({
  isAdmin,
  coId,
  backToBrowse,
  mode,
}: EditCompanyTabProps) {
  const { company, loading } = useCompanyById(coId);
  const actionHook = mode === "approve" ? useApproveCompany : useUpdateCompany;
  const { mutate, isPending } = actionHook();

  if (loading) return <Spinner />;

  const initialData: FormCompany = {
    name: company?.name ?? "",
    logo: company?.logo ?? "",
    type: company?.type ?? "global",
    hqCountryCode: company?.hqCountryCode ?? "",
  };

  function handleAction(current: FormCompany) {
    mutate({ coId, updates: current as CoUpdates });

    backToBrowse();
  }

  return (
    <CoForm
      initData={initialData}
      isAdmin={isAdmin}
      onSubmit={handleAction}
      isSubmitting={isPending}
      approve={mode === "approve"}
    />
  );
}
