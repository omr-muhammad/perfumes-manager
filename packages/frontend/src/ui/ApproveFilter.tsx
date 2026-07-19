import { useTranslation } from "react-i18next";
import styles from "./styles/approve-filter.module.css";

type Approve = boolean | undefined;
interface ApproveFilterProps {
  approved: Approve;
  handleActive: (value: Approve) => void;
  nsFile?: string;
}

export default function ApproveFilter({
  approved,
  handleActive,
  nsFile,
}: ApproveFilterProps) {
  const { t } = useTranslation(nsFile);

  return (
    <div
      className={`${styles.filter} ${
        approved === true
          ? styles.approved
          : approved === false
            ? styles.pending
            : styles.none
      }`}
    >
      <button
        type="button"
        className={styles.option}
        onClick={() => handleActive(approved === true ? undefined : true)}
      >
        {t("approve")}
      </button>

      <button
        type="button"
        className={styles.option}
        onClick={() => handleActive(approved === false ? undefined : false)}
      >
        {t("pending")}
      </button>
    </div>
  );
}
