import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { TwoSlot } from "../TwoSlot/TwoSlot";
import type { CompoundSearch, NormalizedItem } from "../types";

import styles from "./BrowseCompounds.module.css";

const DEFAULT_SEARCH: CompoundSearch = { type: "perfume", text: "" };

export function BrowseCompounds() {
  const { t } = useTranslation();

  const [search, setSearch] = useState<CompoundSearch>(DEFAULT_SEARCH);
  const [opponentItems, setOpponentItems] = useState<NormalizedItem[]>([]);
  const [selectedPerfume, setSelectedPerfume] = useState<NormalizedItem | null>(
    null,
  );
  const [selectedCompany, setSelectedCompany] = useState<NormalizedItem | null>(
    null,
  );

  const [resetToken, setResetToken] = useState(0);

  const canUseCompound = selectedPerfume !== null && selectedCompany !== null;

  function handleSearch(newValue: typeof search) {
    if (newValue.text === "") setOpponentItems([]);

    setSearch((c) => ({ ...c, ...newValue }));
  }

  function handleSelectPerfume(item: NormalizedItem | null) {
    /** A)
     * Selecting a perfume while type isn't perfume
     * means query made by country
     * and the perfume selection completing the compound
     */
    if (search.type !== "perfume") {
      setSelectedPerfume(item);
      return;
    }

    // B)
    setSelectedPerfume(item);
    setSelectedCompany(null);
    setOpponentItems(item?.pairings ?? []);
  }

  function handleSelectCompany(item: NormalizedItem | null) {
    // Same as case A in `handleSelectPerfume
    if (search.type !== "company") {
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
    setSearch(DEFAULT_SEARCH);
    setOpponentItems([]);
    setResetToken((k) => k + 1); // remount TwoSlot to clear focusedInput/isFlipped
  }

  return (
    <div className={styles.page}>
      <TwoSlot
        key={resetToken}
        search={search}
        setSearch={handleSearch}
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
