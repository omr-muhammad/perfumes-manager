import { useEffect, useRef, useState } from "react";
import { MdGppGood } from "react-icons/md";
import { CgSandClock } from "react-icons/cg";
import { HiDotsVertical } from "react-icons/hi";
import styles from "./company-card-mini.module.css";
import { useTranslation } from "react-i18next";
import { useConfirm } from "../../contexts/ConfirmContext";
import type { Company } from "../../api/companiesAPI";
// import { useDeletePerfume } from "./hook";

type MiniCo = Omit<Company, "createdAt" | "updatedAt" | "logo">;

interface CoMiniCardProps {
  company: MiniCo;
  isAdmin: boolean;
  nsFile?: string;
  onEdit: (coId: number, coName: string) => void;
  onApprove: (coId: number, coName: string) => void;
}

export function CoMiniCard({
  company,
  isAdmin,
  nsFile = "perfumes",
  onEdit,
  onApprove,
}: CoMiniCardProps) {
  const { t } = useTranslation([nsFile, "countries"]);
  const { name, hqCountryCode, approved, type } = company;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();
  // const { deletePerfume } = useDeletePerfume();

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

  function handleEdit() {
    setMenuOpen(false);
    onEdit(company.id, company.name);
  }

  function handleApprove() {
    setMenuOpen(false);
    onApprove(company.id, company.name);
  }

  async function handleDelete() {
    setMenuOpen(false);

    const confirmed = await confirm({
      title: t("confirmDeleteTitle", { coName: company.name }),
      message: t("warnDeleteMsg"),
    });

    if (!confirmed) return;

    console.log("Co deleted");
    // deletePerfume(company.id);
  }

  // console.log(hqCountryCode);

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <h3 className={styles.name} title={name}>
          {name}
        </h3>
        {hqCountryCode && (
          <span
            className={styles.badge}
            title={t(`countries:${hqCountryCode}`)}
          >
            {hqCountryCode}
          </span>
        )}
        {type && (
          <span className={styles.badge} title={t(`companies:${type}`)}>
            {t(type.slice(0, 1))}
          </span>
        )}
        {approved ? (
          <MdGppGood
            className={styles.statusIcon}
            data-status="approved"
            title={t("companies:approved")}
          />
        ) : (
          <CgSandClock
            className={styles.statusIcon}
            data-status="pending"
            title={t("companies:pending")}
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
                {t("companies:edit")}
              </button>

              {!approved && (
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleApprove}
                >
                  {t("companies:approve")}
                </button>
              )}

              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={handleDelete}
              >
                {t("companies:delete")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
