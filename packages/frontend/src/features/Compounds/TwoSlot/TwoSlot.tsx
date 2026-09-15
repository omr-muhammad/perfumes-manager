import { useLayoutEffect, useRef, useState, type FocusEvent } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FiRepeat } from "react-icons/fi";
import { Slot } from "../Slot/Slot";
import { ActionToolbar } from "../../../ui/ActionToolbar/ActionToolbar";
import styles from "./TwoSlot.module.css";
import { useDebounce } from "../../../hooks/useDebounce";
import { useDeleteCompound, useInfiniteCompounds } from "../hooks";
import type {
  CompoundItem,
  CompoundsGetResponse,
  CompoundsQuery,
} from "../../../api/compoundsAPI";

type SlotSide = "left" | "right";
interface TwoSlotProps {
  query: CompoundsQuery;
  handleQuery: (s: CompoundsQuery) => void;
  opponentItems: CompoundsGetResponse;
  selectedPerfume: CompoundItem | null;
  selectedCompany: CompoundItem | null;
  onSelectPerfume: (item: CompoundItem | null) => void;
  onSelectCompany: (item: CompoundItem | null) => void;
}

export function TwoSlot({
  query,
  handleQuery,
  opponentItems,
  selectedPerfume,
  selectedCompany,
  onSelectPerfume,
  onSelectCompany,
}: TwoSlotProps) {
  const { t } = useTranslation();
  const { deleteCompound, deletingCompound } = useDeleteCompound();

  const [focusedInput, setFocusedInput] = useState<SlotSide | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const headerInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(query.search, 400);
  const { compounds, fetchNextPage, isFetchingNextPage, hasNextPage, loading } =
    useInfiniteCompounds({ ...query, search: debouncedSearch });

  // Re-focus the input at its new (header zone) location the moment it
  // mounts there, so the View Transition's visual move is followed by an
  // uninterrupted typing experience rather than a dropped caret.
  useLayoutEffect(() => {
    if (focusedInput !== null) {
      headerInputRef.current?.focus();
    }
  }, [focusedInput]);

  const perfumeItemsList = query.type === "perfume" ? compounds : opponentItems;
  const companyItemsList = query.type === "company" ? compounds : opponentItems;

  // ---- Architecture Decision 4: startViewTransition(() => flushSync(...)).
  // Each Slot gets its own wrapped setter matching the exact `(s) => void`
  // shape it expects. The wrapper is what actually detects "this call is
  // establishing focus on a previously-unfocused side" (the moment that
  // needs the animated flushSync+startViewTransition dance) vs. "this call
  // is just an ordinary keystroke on the side that's already focused" (a
  // plain state update) — so Slot's own inline `onFocus`/`onChange`
  // handlers can stay simple and side-agnostic. `setSearch` here is the
  // prop from BrowseCompounds; flushSync doesn't care which component a
  // piece of state belongs to, so batching a parent-owned setter together
  // with this component's own local `setFocusedInput` works the same way
  // it would if both were local.
  function makeFocusAwareQuery(side: SlotSide) {
    return (next: CompoundsQuery) => {
      const isNewFocus = focusedInput !== side;

      if (!isNewFocus) return handleQuery(next);

      const commitFocus = () =>
        flushSync(() => {
          setFocusedInput(side);
          handleQuery(next);
        });

      // check of borwser support transition api:
      // yes => go with it || no => fallback to unanimated moving
      if (typeof document !== "undefined" && document.startViewTransition) {
        document.startViewTransition(commitFocus);
      } else {
        commitFocus();
      }
    };
  }

  function showInlineInput(side: SlotSide): boolean {
    return (
      focusedInput === null || (focusedInput !== side && query.search === "")
    );
  }

  function handleHeaderBlur(e: FocusEvent) {
    /** 
     * Prevent transition if user is clicking
        1) a list item inside the same component
        2) anywhere but search.text !== ""
    * */
    if (
      query.search ||
      e.currentTarget
        ?.closest(`.${styles.grid}`)
        ?.contains(e.relatedTarget as Node)
    )
      return;

    const commitBlur = () =>
      flushSync(() => {
        setFocusedInput(null);
      });

    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(commitBlur);
    } else {
      commitBlur();
    }
  }

  function emptyMessage(type: CompoundsQuery["type"]): string {
    const oppositeType = type === "perfume" ? "company" : "perfume";

    if (type !== query.type) {
      return query.search
        ? t(`compounds:selectToShow.${type}`)
        : focusedInput !== null
          ? t(`compounds:searchToBegin.${oppositeType}`)
          : t(`compounds:searchToBegin.${type}`);
    }

    /**
     * if same type and text isn't "" there won't be an emptyMsg
     * since list is already there or `no result found.`
     */
    return query.search ? "" : t(`compounds:searchToBegin.${type}`);
  }

  const bothSelected = selectedPerfume !== null && selectedCompany !== null;

  function handleEdit() {
    console.log("[compounds] edit compound", {
      selectedPerfume,
      selectedCompany,
    });
    toast(t("compounds:edit"));
  }

  function handleDelete() {
    if (!selectedCompany || !selectedPerfume) return;

    const compoundId = (
      query.type === "perfume"
        ? selectedCompany.compoundId
        : selectedPerfume.compoundId
    )!;

    deleteCompound(compoundId);
    toast(t("compounds:delete"));
  }

  const handleFlip = () => setIsFlipped((f) => !f);

  function renderHeaderZone(side: SlotSide, type: CompoundsQuery["type"]) {
    if (focusedInput === side) {
      return (
        <>
          <span className={styles.headerLabel}>{t(`compounds:${type}`)}</span>
          <input
            ref={headerInputRef}
            className={styles.morphingInput}
            style={{ viewTransitionName: `search-input-${type}` }}
            type="text"
            value={query.search}
            placeholder={t(`compounds:searchPlaceholder.${type}`)}
            onChange={(e) => handleQuery({ ...query, search: e.target.value })}
            onBlur={handleHeaderBlur}
          />
        </>
      );
    }

    if (
      query.type !== type &&
      bothSelected &&
      selectedPerfume &&
      selectedCompany
    ) {
      return (
        <ActionToolbar
          disabled={deletingCompound}
          perfumeName={selectedPerfume.name}
          companyName={selectedCompany.name}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      );
    }

    return null;
  }

  return (
    <div className={`${styles.grid} ${isFlipped ? styles.flipped : ""}`}>
      <div className={styles.headerA}>
        {renderHeaderZone("left", "perfume")}
      </div>
      <div className={styles.listA}>
        <Slot
          title="perfume"
          query={query}
          onFocusChange={makeFocusAwareQuery("left")}
          itemsList={perfumeItemsList}
          selectedItemId={selectedPerfume?.id ?? null}
          onSelectItem={onSelectPerfume}
          emptyStateMessage={emptyMessage("perfume")}
          showInlineInput={showInlineInput("left")}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          loading={loading}
        />
      </div>

      <button
        type="button"
        className={styles.flipper}
        onClick={handleFlip}
        aria-label={t("compounds:flip")}
        title={t("compounds:flip")}
      >
        <FiRepeat aria-hidden="true" />
      </button>

      <div className={styles.headerB}>
        {renderHeaderZone("right", "company")}
      </div>
      <div className={styles.listB}>
        <Slot
          title="company"
          query={query}
          onFocusChange={makeFocusAwareQuery("right")}
          itemsList={companyItemsList}
          selectedItemId={selectedCompany?.id ?? null}
          onSelectItem={onSelectCompany}
          emptyStateMessage={emptyMessage("company")}
          showInlineInput={showInlineInput("right")}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          loading={loading}
        />
      </div>
    </div>
  );
}
