import { useTranslation } from "react-i18next";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import styles from "./ActionToolbar.module.css";

interface ActionToolbarProps {
  perfumeName: string;
  companyName: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionToolbar({
  perfumeName,
  companyName,
  onEdit,
  onDelete,
}: ActionToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.toolbar}>
      <p className={styles.label}>
        {perfumeName}{" "}
        <span className={styles.by}>{t("compounds:inTitle")}</span>{" "}
        {companyName}
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onEdit}
          aria-label={t("compounds:edit")}
          title={t("compounds:edit")}
        >
          <FiEdit3 aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.iconButtonDanger}`}
          onClick={onDelete}
          aria-label={t("compounds:delete")}
          title={t("compounds:delete")}
        >
          <FiTrash2 aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
