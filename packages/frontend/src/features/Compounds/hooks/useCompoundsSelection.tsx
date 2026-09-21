import { useState } from "react";
import type { CompoundsQuery } from "../../../api/compoundsAPI";
import { useDeleteCompound, useInfiniteCompounds } from "../hooks";
import { useDebounce } from "../../../hooks/useDebounce";
import toast from "react-hot-toast";

const DEFAULT_SEARCH: CompoundsQuery = {
  type: "perfume",
  search: "",
  page: 1,
  limit: 10,
};
type ID = number | undefined;

export function useCompoundsSelection() {
  // States
  const [query, setQuery] = useState<CompoundsQuery>(DEFAULT_SEARCH);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<ID>(undefined);
  const [selectedCompanyId, setSelectedCompanyId] = useState<ID>(undefined);
  const [resetToken, setResetToken] = useState(0);

  const debouncedSearch = useDebounce(query.search, 400);

  // Custom Hooks

  const { deleteCompound, deletingCompound } = useDeleteCompound(query);
  const { compounds, loading, pagination } = useInfiniteCompounds({
    ...query,
    search: debouncedSearch,
  });

  // Derived state

  // step 1
  const livePerfume =
    query.type === "perfume"
      ? compounds.find((c) => c.id === selectedPerfumeId)
      : undefined;
  const liveCompany =
    query.type === "company"
      ? compounds.find((c) => c.id === selectedCompanyId)
      : undefined;

  // step 2
  const perfumesList =
    query.type === "perfume" ? compounds : (liveCompany?.pairings ?? []);
  const companiesList =
    query.type === "company" ? compounds : (livePerfume?.pairings ?? []);

  // step 3
  const oppositePerfume =
    query.type === "company"
      ? perfumesList.find((p) => p.id === selectedPerfumeId)
      : undefined;
  const oppositeCompany =
    query.type === "perfume"
      ? companiesList.find((c) => c.id === selectedCompanyId)
      : undefined;

  // step 4
  const selectedPerfume = livePerfume ?? oppositePerfume;
  const selectedCompany = liveCompany ?? oppositeCompany;
  const bothSelected = !!selectedPerfume && !!selectedCompany;

  // Actions
  function handleQuery(newValue: typeof query) {
    setQuery((c) => ({ ...c, ...newValue }));
  }

  function handleSelectPerfume(id?: number) {
    setSelectedPerfumeId(id);

    if (query.type === "perfume") setSelectedCompanyId(undefined);
  }

  function handleSelectCompany(id?: number) {
    console.log(`We're here id: ${id}`);
    setSelectedCompanyId(id);

    if (query.type === "company") setSelectedPerfumeId(undefined);
  }

  function handleReset() {
    setSelectedPerfumeId(undefined);
    setSelectedCompanyId(undefined);
    setQuery(DEFAULT_SEARCH);
    setResetToken((k) => k + 1); // remount TwoSlot to clear focusedInput/isFlipped
  }

  function handleUseCompound() {
    if (!bothSelected) return;

    toast.success(
      `compound used successfully ${selectedPerfume.name}-${selectedCompany.name}`,
    );

    handleReset();
  }

  function handleDelete() {
    if (!bothSelected) return;

    // Group assign
    const compoundId =
      query.type === "perfume"
        ? selectedCompany.compoundId
        : selectedPerfume.compoundId;

    // api
    deleteCompound(compoundId!);

    toast.success("compounds:delete");
  }

  return {
    // data
    query,
    perfumesList,
    companiesList,
    selectedPerfume,
    selectedCompany,
    bothSelected,
    resetToken,
    loading,
    deletingCompound,

    // actions
    handleQuery,
    handleSelectPerfume,
    handleSelectCompany,
    handleUseCompound,
    handleDelete,

    // pagination
    pagination,
  };
}
