import { useTranslation } from "react-i18next";
import styles from "./styles/tag.module.css";
import { IoIosClose } from "react-icons/io";

interface TagProps {
  key: string;
  label: string;
  className: string;
  onRemove: () => void;
}

export function FilterTag({ key, label, onRemove, className }: TagProps) {
  const { t } = useTranslation("perfumes");
  return (
    <span className={className} key={key}>
      {label}
      <button
        type="button"
        className={styles.filterTagRemove}
        aria-label={t("removeFilter")}
        onClick={onRemove}
      >
        <IoIosClose />
      </button>
    </span>
  );
}
