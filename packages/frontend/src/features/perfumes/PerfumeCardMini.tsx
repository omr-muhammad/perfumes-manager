import { useEffect, useRef, useState } from "react";
import { MdGppGood } from "react-icons/md";
import { CgSandClock } from "react-icons/cg";
import { HiDotsVertical } from "react-icons/hi";
import styles from "./perfume-card-mini.module.css";
import { useTranslation } from "react-i18next";

interface Perfume {
  id: number;
  name: string;
  sex: "male" | "female" | "unisex" | null;
  approved: boolean;
}

interface PerfumeCardMiniProps {
  perfume: Perfume;
  isAdmin: boolean;
  nsFile?: string;
}

export default function PerfumeCardMini({
  perfume,
  isAdmin,
  nsFile,
}: PerfumeCardMiniProps) {
  const { t } = useTranslation(nsFile);
  const { name, sex, approved } = perfume;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleEdit = () => {
    setMenuOpen(false);
    console.log("edited");
  };

  const handleApprove = () => {
    setMenuOpen(false);
    console.log("approved");
  };

  const handleDelete = () => {
    setMenuOpen(false);
    console.log("deleted");
  };

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <h3 className={styles.name}>{name}</h3>
        {sex && <span className={styles.sexBadge}>{t(sex)}</span>}
        {approved ? (
          <MdGppGood
            className={styles.statusIcon}
            data-status="approved"
            title={t("approved")}
          />
        ) : (
          <CgSandClock
            className={styles.statusIcon}
            data-status="pending"
            title={t("pending")}
          />
        )}
      </div>

      {isAdmin && (
        <div className={styles.menuWrap} ref={menuRef}>
          <button
            type="button"
            className={styles.dotsBtn}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Card options"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <HiDotsVertical />
          </button>

          {menuOpen && (
            <div className={styles.menu}>
              <button
                type="button"
                className={styles.menuItem}
                onClick={handleEdit}
              >
                {t("edit")}
              </button>

              {!approved && (
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleApprove}
                >
                  {t("approve")}
                </button>
              )}

              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={handleDelete}
              >
                {t("delete")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
