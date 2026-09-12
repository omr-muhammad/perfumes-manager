import { useLayoutEffect, useRef, useState, type FocusEvent } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { FiRepeat } from "react-icons/fi";
import { Slot } from "../Slot/Slot";
import { ActionToolbar } from "../../../ui/ActionToolbar/ActionToolbar";
import type {
  CompoundSearch,
  EntityType,
  NormalizedItem,
  SlotSide,
} from "../types";
import styles from "./TwoSlot.module.css";
import { useDebounce } from "../../../hooks/useDebounce";
import { useInfiniteCompounds } from "../hooks";

interface TwoSlotProps {
  // Feature-level state — owned and reset by BrowseCompounds (see the
  // comment there for why). TwoSlot only ever reads/updates it via props.
  search: CompoundSearch;
  setSearch: (s: CompoundSearch) => void;
  opponentItems: NormalizedItem[];
  selectedPerfume: NormalizedItem | null;
  selectedCompany: NormalizedItem | null;
  onSelectPerfume: (item: NormalizedItem | null) => void;
  onSelectCompany: (item: NormalizedItem | null) => void;
}

export function TwoSlot({
  search,
  setSearch,
  opponentItems,
  selectedPerfume,
  selectedCompany,
  onSelectPerfume,
  onSelectCompany,
}: TwoSlotProps) {
  const { t } = useTranslation();

  const [focusedInput, setFocusedInput] = useState<SlotSide | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const headerInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search.text, 400);
  const { compounds, fetchNextPage, isFetchingNextPage, hasNextPage, loading } =
    useInfiniteCompounds({
      type: search.type,
      search: debouncedSearch,
      page: 1,
      limit: 10,
    });

  // Re-focus the input at its new (header zone) location the moment it
  // mounts there, so the View Transition's visual move is followed by an
  // uninterrupted typing experience rather than a dropped caret.
  useLayoutEffect(() => {
    if (focusedInput !== null) {
      headerInputRef.current?.focus();
    }
  }, [focusedInput]);

  const perfumeItemsList =
    search.type === "perfume" ? compounds : opponentItems;
  const companyItemsList =
    search.type === "company" ? compounds : opponentItems;

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
  function makeSetSearch(side: SlotSide) {
    return (next: CompoundSearch) => {
      if (focusedInput !== side) {
        const commitFocus = () =>
          flushSync(() => {
            setFocusedInput(side);
            setSearch(next);
          });
        if (typeof document !== "undefined" && document.startViewTransition) {
          document.startViewTransition(commitFocus);
        } else {
          commitFocus(); // feature-detect fallback — no animation, state still updates
        }
        return;
      }
      setSearch(next);
    };
  }

  function showInlineInput(side: SlotSide): boolean {
    return (
      focusedInput === null || (focusedInput !== side && search.text === "")
    );
  }

  function handleHeaderBlur(e: FocusEvent) {
    /** 
     * Prevent transition if user is clicking
        1) a list item inside the same component
        2) anywhere but search.text !== ""
    * */
    if (
      search.text ||
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

  function emptyMessage(type: EntityType): string {
    const oppositeType = type === "perfume" ? "company" : "perfume";

    if (type !== search.type) {
      return search.text
        ? t(`compounds:selectToShow.${type}`)
        : focusedInput !== null
          ? t(`compounds:searchToBegin.${oppositeType}`)
          : t(`compounds:searchToBegin.${type}`);
    }

    /**
     * if same type and text isn't "" there won't be an emptyMsg
     * since list is already there or `no result found.`
     */
    return search.text ? "" : t(`compounds:searchToBegin.${type}`);
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
    console.log("[compounds] delete compound", {
      selectedPerfume,
      selectedCompany,
    });
    toast(t("compounds:delete"));
  }

  const handleFlip = () => setIsFlipped((f) => !f);

  function renderHeaderZone(side: SlotSide, type: EntityType) {
    if (focusedInput === side) {
      return (
        <>
          <span className={styles.headerLabel}>{t(`compounds:${type}`)}</span>
          <input
            ref={headerInputRef}
            className={styles.morphingInput}
            style={{ viewTransitionName: `search-input-${type}` }}
            type="text"
            value={search.text}
            placeholder={t(`compounds:searchPlaceholder.${type}`)}
            onChange={(e) => setSearch({ ...search, text: e.target.value })}
            onBlur={handleHeaderBlur}
          />
        </>
      );
    }

    if (
      search.type !== type &&
      bothSelected &&
      selectedPerfume &&
      selectedCompany
    ) {
      return (
        <ActionToolbar
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
          search={search}
          setSearch={makeSetSearch("left")}
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
          search={search}
          setSearch={makeSetSearch("right")}
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
