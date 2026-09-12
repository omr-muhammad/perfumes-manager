import { useEffect, useRef, useState } from "react";
import { MdGppGood } from "react-icons/md";
import { CgSandClock } from "react-icons/cg";
import { HiDotsVertical } from "react-icons/hi";
import { BiWorld, BiMapPin } from "react-icons/bi";
import styles from "./company-card-mini.module.css";
import { useTranslation } from "react-i18next";
import { useConfirm } from "../../contexts/ConfirmContext";
import type { Company } from "../../api/companiesAPI";
import { getFlagEmoji } from "../../utils/countries";
import type { Tab } from "../../ui/TabList/TabList";
import { useDeleteCompany } from "./hooks";

// import { useDeletePerfume } from "./hook";

type MiniCo = Omit<Company, "createdAt" | "updatedAt" | "logo">;

interface CoMiniCardProps {
  company: MiniCo;
  isAdmin: boolean;
  handleTabActivation: (tab: Tab) => void;
}

export function CoMiniCard({
  company,
  isAdmin,
  handleTabActivation,
}: CoMiniCardProps) {
  const { t } = useTranslation();
  const { name, hqCountryCode, approved, type } = company;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();
  const { deleteCo, deleting } = useDeleteCompany();

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
    handleTabActivation({
      type: "edit",
      id: company.id,
      name: t("panelBtns.edit", { name: company.name }),
    });
  }

  function handleApprove() {
    setMenuOpen(false);
    handleTabActivation({
      type: "approve",
      id: company.id,
      name: t("panelBtns.approve", { name: company.name }),
    });
  }

  async function handleDelete() {
    setMenuOpen(false);

    const confirmed = await confirm({
      title: t("modal.confirmDeleteTitle", { name: company.name }),
      message: t("modal.warnDeleteMsg"),
    });

    if (!confirmed) return;

    deleteCo(company.id);
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
            className={styles.statusIcon}
            title={t(`countries:${hqCountryCode}`)}
          >
            {getFlagEmoji(hqCountryCode)}
          </span>
        )}
        {type &&
        // <span className={styles.badge} title={t(`companies:${type}`)}>
        //   {t(type.slice(0, 1))}
        // </span>
        type === "global" ? (
          <BiWorld
            className={styles.statusIcon}
            data-staus={type}
            title={t(`companies:${type}`)}
          />
        ) : (
          <BiMapPin
            className={styles.statusIcon}
            data-staus={type}
            title={t(`companies:${type}`)}
          />
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
            disabled={deleting}
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
