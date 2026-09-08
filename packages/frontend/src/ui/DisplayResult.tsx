import styles from "./styles/display-result.module.css";

export type ResultItem = {
  code: string;
  name: string;
};

type DisplayResultProps = {
  /** Items to render. Empty array renders the "no results" row. */
  results: ResultItem[];
  /** Controlled visibility — parent owns open/close (e.g. focus/blur on the search wrapper). */
  isOpen: boolean;
  /** Fires with the full item on click; parent decides what to do (usually: set input text to item.name, store item.code). */
  onSelect: (item: ResultItem) => void;
  /** Already-translated label for the empty state — parent's job, not this component's. */
  noResultsLabel: string;
};

export default function DisplayResult({
  results,
  isOpen,
  onSelect,
  noResultsLabel,
}: DisplayResultProps) {
  if (!isOpen) return null;

  const hasResults = results.length > 0;

  return (
    <ul className={styles.container} role="listbox">
      {hasResults ? (
        results.map((item) => (
          <li
            key={item.code}
            role="option"
            className={styles.item}
            // Keeps the search input focused on click so a parent's
            // "close on blur" handler doesn't fire before onClick runs.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item)}
          >
            {item.name}
          </li>
        ))
      ) : (
        <li className={styles.empty} aria-disabled="true">
          {noResultsLabel}
        </li>
      )}
    </ul>
  );
}
