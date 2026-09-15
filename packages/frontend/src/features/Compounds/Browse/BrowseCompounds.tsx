import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { TwoSlot } from "../TwoSlot/TwoSlot";

import styles from "./BrowseCompounds.module.css";
import type {
  CompoundItem,
  CompoundsGetResponse,
  CompoundsQuery,
} from "../../../api/compoundsAPI";

const DEFAULT_SEARCH: CompoundsQuery = {
  type: "perfume",
  search: "",
  page: 1,
  limit: 10,
};

export function BrowseCompounds() {
  const { t } = useTranslation();

  const [query, setQuery] = useState<CompoundsQuery>(DEFAULT_SEARCH);
  const [opponentItems, setOpponentItems] = useState<CompoundsGetResponse>([]);
  const [selectedPerfume, setSelectedPerfume] = useState<CompoundItem | null>(
    null,
  );
  const [selectedCompany, setSelectedCompany] = useState<CompoundItem | null>(
    null,
  );

  const [resetToken, setResetToken] = useState(0);

  const canUseCompound = selectedPerfume !== null && selectedCompany !== null;

  function handleQuery(newValue: typeof query) {
    if (newValue.search === "") setOpponentItems([]);

    setQuery((c) => ({ ...c, ...newValue }));
  }

  function handleSelectPerfume(item: CompoundItem | null) {
    /** A)
     * Selecting a perfume while type isn't perfume
     * means query made by country
     * and the perfume selection completing the compound
     */
    if (query.type !== "perfume") {
      setSelectedPerfume(item);
      return;
    }

    // B)
    setSelectedPerfume(item);
    setSelectedCompany(null);
    setOpponentItems(item?.pairings ?? []);
  }

  function handleSelectCompany(item: CompoundItem | null) {
    // Same as case A in `handleSelectPerfume
    if (query.type !== "company") {
      setSelectedCompany(item);
      return;
    }

    setSelectedCompany(item);
    setSelectedPerfume(null);
    setOpponentItems(item?.pairings ?? []);
  }

  function handleUseCompound() {
    if (!selectedPerfume || !selectedCompany) return;

    // Placeholder — real mutation comes later via React Query.
    console.log("[compounds] use compound", {
      selectedPerfume,
      selectedCompany,
    });
    toast.success(
      `compound used successfully ${selectedPerfume.name}-${selectedCompany.name}`,
    );

    setSelectedPerfume(null);
    setSelectedCompany(null);
    setQuery(DEFAULT_SEARCH);
    setOpponentItems([]);
    setResetToken((k) => k + 1); // remount TwoSlot to clear focusedInput/isFlipped
  }

  return (
    <div className={styles.page}>
      <TwoSlot
        key={resetToken}
        query={query}
        handleQuery={handleQuery}
        opponentItems={opponentItems}
        selectedPerfume={selectedPerfume}
        selectedCompany={selectedCompany}
        onSelectPerfume={handleSelectPerfume}
        onSelectCompany={handleSelectCompany}
      />

      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.useCompoundButton}
          disabled={!canUseCompound}
          onClick={handleUseCompound}
        >
          {t("compounds:useCompound")}
        </button>
      </div>
    </div>
  );
}
