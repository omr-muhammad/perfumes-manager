import { useTranslation } from "react-i18next";
import styles from "./styles/approve-filter.module.css";
import type { CoQuery } from "../api/companiesAPI";

type CoType = CoQuery["type"];

interface CoTypeFilterProps {
  coType: CoType;
  handleActive: (value: CoType) => void;
  nsFile?: string;
}

export function TypeFilter({
  coType,
  handleActive,
  nsFile,
}: CoTypeFilterProps) {
  const { t } = useTranslation(nsFile);

  return (
    <div
      className={`${styles.filter} ${
        coType === "global"
          ? styles.global
          : coType === "local"
            ? styles.local
            : styles.none
      }`}
    >
      <button
        type="button"
        className={styles.option}
        onClick={() => handleActive(coType === "global" ? undefined : "global")}
      >
        {t("global")}
      </button>

      <button
        type="button"
        className={styles.option}
        onClick={() => handleActive(coType === "local" ? undefined : "local")}
      >
        {t("local")}
      </button>
    </div>
  );
}
