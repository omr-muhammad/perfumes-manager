import styles from "./SegmentedFilter.module.css";

interface Option<T> {
  value: T;
  label: string;
}

interface SegmentedFilterProps<T> {
  options: [Option<T>, Option<T>];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

export function SegmentedFilter<T>({
  options,
  value,
  onChange,
}: SegmentedFilterProps<T>) {
  const [first, second] = options;
  const state =
    value === first.value
      ? styles.first
      : value === second.value
        ? styles.second
        : styles.none;

  return (
    <div className={`${styles.filter} ${state}`}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          className={styles.option}
          onClick={() => onChange(value === o.value ? undefined : o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
