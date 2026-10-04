import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { MdGppGood } from "react-icons/md";
import { CgSandClock } from "react-icons/cg";
import { HiDotsVertical } from "react-icons/hi";

import { useConfirm } from "@/contexts/ConfirmContext";

import { useDeletePerfume } from "../hooks/useDeletePerfume";

import type { Perfume } from "../types";

import styles from "./PerfumeCardMini.module.css";

// interface Perfume {
//   id: number;
//   name: string;
//   sex: "male" | "female" | "unisex" | null;
//   approved: boolean;
// }
type MiniPerfume = Pick<Perfume, "id" | "name" | "sex" | "approved">;

interface PerfumeCardMiniProps {
  perfume: MiniPerfume;
  isAdmin: boolean;
  onEdit: (perfumeId: number, perfumeName: string) => void;
  onApprove: (perfumeId: number, perfumeName: string) => void;
}

export function PerfumeCardMini({
  perfume,
  isAdmin,
  onEdit,
  onApprove,
}: PerfumeCardMiniProps) {
  const { t } = useTranslation();
  const { name, sex, approved } = perfume;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();
  const { deletePerfume } = useDeletePerfume();

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
    onEdit(perfume.id, perfume.name);
  }

  function handleApprove() {
    setMenuOpen(false);
    onApprove(perfume.id, perfume.name);
  }

  async function handleDelete() {
    setMenuOpen(false);

    const confirmed = await confirm({
      title: t("confirmDeleteTitle", { perfumeName: perfume.name }),
      message: t("warnDeleteMsg"),
    });

    if (!confirmed) return;

    deletePerfume(perfume.id);
  }

  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <h3 className={styles.name}>{name}</h3>
        {sex && <span className={styles.sexBadge}>{t(sex)}</span>}
        {approved ? (
          <MdGppGood
            className={styles.statusIcon}
            data-status="approved"
            title={t("perfumes:approved")}
          />
        ) : (
          <CgSandClock
            className={styles.statusIcon}
            data-status="pending"
            title={t("perfumes:pending")}
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
                {t("perfumes:edit")}
              </button>

              {!approved && (
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleApprove}
                >
                  {t("perfumes:approve")}
                </button>
              )}

              <button
                type="button"
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={handleDelete}
              >
                {t("perfumes:delete")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
