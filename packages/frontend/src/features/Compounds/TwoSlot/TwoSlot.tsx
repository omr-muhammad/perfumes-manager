import { useLayoutEffect, useRef, useState, type FocusEvent } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { FiRepeat } from "react-icons/fi";
import { Slot } from "../Slot/Slot";
import { ActionToolbar } from "../../../ui/ActionToolbar/ActionToolbar";
import styles from "./TwoSlot.module.css";
import type { CompoundsQuery } from "../../../api/compoundsAPI";
import { useCompoundsSelection } from "../hooks/useCompoundsSelection";
import type { Tab } from "../../../ui/TabList/TabList";

type SlotSide = "left" | "right";

interface TwoSlotProps {
  handleActiveTab: (tab: Tab) => void;
}

export function TwoSlot({ handleActiveTab }: TwoSlotProps) {
  const { t } = useTranslation();
  const { pagination, ...selection } = useCompoundsSelection();

  const [focusedInput, setFocusedInput] = useState<SlotSide | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const headerInputRef = useRef<HTMLInputElement>(null);

  // Re-focus the input at its new (header zone) location the moment it
  // mounts there, so the View Transition's visual move is followed by an
  // uninterrupted typing experience rather than a dropped caret.
  useLayoutEffect(() => {
    if (focusedInput !== null) {
      headerInputRef.current?.focus();
    }
  }, [focusedInput]);

  function makeFocusAwareQuery(side: SlotSide) {
    return (next: CompoundsQuery) => {
      const isNewFocus = focusedInput !== side;

      if (!isNewFocus) return selection.handleQuery(next);

      const commitFocus = () =>
        flushSync(() => {
          setFocusedInput(side);
          selection.handleQuery(next);
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
      focusedInput === null ||
      (focusedInput !== side && selection.query.search === "")
    );
  }

  function handleHeaderBlur(e: FocusEvent) {
    /** 
     * Prevent transition if user is clicking
        1) a list item inside the same component
        2) anywhere but search.text !== ""
    * */
    if (
      selection.query.search ||
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

    if (type !== selection.query.type) {
      return selection.query.search
        ? t(`compounds:selectToShow.${type}`)
        : focusedInput !== null
          ? t(`compounds:searchToBegin.${oppositeType}`)
          : t(`compounds:searchToBegin.${type}`);
    }

    /**
     * if same type and text isn't "" there won't be an emptyMsg
     * since list is already there or `no result found.`
     */
    return selection.query.search ? "" : t(`compounds:searchToBegin.${type}`);
  }

  function handleEdit() {
    if (!selection.bothSelected) return;

    const compoundId =
      selection.selectedPerfume!.compoundId ??
      selection.selectedCompany!.compoundId;
    const compoundName = `${selection.selectedPerfume!.name} - ${selection.selectedCompany!.name}`;

    handleActiveTab({
      type: "edit",
      id: compoundId!,
      name: t("panelBtns.edit", { name: compoundName }),
    });
  }

  function navToAdd() {
    const opponentId =
      selection.query.type === "perfume"
        ? selection.selectedPerfume?.id
        : selection.selectedCompany?.id;
    const opponentName =
      selection.query.type === "perfume"
        ? selection.selectedPerfume?.name
        : selection.selectedCompany?.name;

    // could be tricky but we send company if title == perfume,
    // so we need the countryCode when sending company
    const countryCode =
      selection.query.type === "company"
        ? selection.selectedCompany?.countryCode
        : undefined;

    const payload = {
      [selection.query.type]: {
        id: opponentId,
        name: opponentName,
        countryCode,
      },
    };

    handleActiveTab({ type: "add", data: payload });
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
            value={selection.query.search}
            placeholder={t(`compounds:searchPlaceholder.${type}`)}
            onChange={(e) =>
              selection.handleQuery({
                ...selection.query,
                search: e.target.value,
              })
            }
            onBlur={handleHeaderBlur}
          />
        </>
      );
    }

    if (selection.query.type !== type && selection.bothSelected) {
      return (
        <ActionToolbar
          disabled={selection.deletingCompound}
          perfumeName={selection.selectedPerfume!.name ?? ""}
          companyName={selection.selectedCompany!.name ?? ""}
          onEdit={handleEdit}
          onDelete={selection.handleDelete}
        />
      );
    }

    return null;
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.grid} ${isFlipped ? styles.flipped : ""}`}>
        <div className={styles.headerA}>
          {renderHeaderZone("left", "perfume")}
        </div>
        <div className={styles.listA}>
          <Slot
            title="perfume"
            query={selection.query}
            onFocusChange={makeFocusAwareQuery("left")}
            itemsList={selection.perfumesList}
            selectedItemId={selection.selectedPerfume?.id ?? null}
            onSelectItem={selection.handleSelectPerfume}
            emptyStateMessage={emptyMessage("perfume")}
            showInlineInput={showInlineInput("left")}
            hasNextPage={pagination.hasNextPage}
            isFetchingNextPage={pagination.isFetchingNextPage}
            fetchNextPage={pagination.fetchNextPage}
            loading={selection.loading}
            navToAddWithPreFilled={navToAdd}
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
            query={selection.query}
            onFocusChange={makeFocusAwareQuery("right")}
            itemsList={selection.companiesList}
            selectedItemId={selection.selectedCompany?.id ?? null}
            onSelectItem={selection.handleSelectCompany}
            emptyStateMessage={emptyMessage("company")}
            showInlineInput={showInlineInput("right")}
            hasNextPage={pagination.hasNextPage}
            isFetchingNextPage={pagination.isFetchingNextPage}
            fetchNextPage={pagination.fetchNextPage}
            loading={selection.loading}
            navToAddWithPreFilled={navToAdd}
          />
        </div>
      </div>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.useCompoundButton}
          disabled={!selection.bothSelected}
          onClick={selection.handleUseCompound}
        >
          {t("compounds:useCompound")}
        </button>
      </div>
    </div>
  );
}
