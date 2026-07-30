import { useState } from "react";
import { loggedUserQuery } from "../Auth/hooks";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BrowseTab } from "./BrowseTab";
import styles from "./perfumes.module.css";
import { AddPerfumeTab } from "./AddPerfumeTab";
import { EditPerfumeTab } from "./EditPerfumeTab";

type PerfumesTab =
  | { type: "browse" }
  | { type: "add" }
  | { type: "edit" | "approve"; perfumeId: number; perfumeName: string };

export function Perfumes() {
  const { t } = useTranslation("perfumes");
  const [activeTab, setActiveTab] = useState<PerfumesTab>({
    type: "browse",
  });

  const { data: user } = useQuery(loggedUserQuery);
  const isAdmin = user?.role === "admin";

  function activeEdit(perfumeId: number, perfumeName: string) {
    setActiveTab({
      type: "edit",
      perfumeId,
      perfumeName,
    });
  }

  function activeApprove(perfumeId: number, perfumeName: string) {
    setActiveTab({
      type: "approve",
      perfumeId,
      perfumeName,
    });
  }

  return (
    <div>
      <div className={styles.tabList} role="tablist">
        <button
          type="button"
          role="tab"
          id="tab-browse"
          aria-selected={activeTab.type === "browse"}
          aria-controls="tabpanel-browse"
          className={`${styles.tab} ${activeTab.type === "browse" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab({ type: "browse" })}
        >
          {t("browse")}
          {activeTab.type === "browse" && (
            <span className={styles.tabIndicator} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-add"
          aria-selected={activeTab.type === "add"}
          aria-controls="tabpanel-add"
          className={`${styles.tab} ${activeTab.type === "add" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab({ type: "add" })}
        >
          {t("add")}
          {activeTab.type === "add" && (
            <span className={styles.tabIndicator} aria-hidden="true" />
          )}
        </button>

        {activeTab.type === "edit" && (
          <button
            type="button"
            role="tab"
            id="tab-edit"
            aria-selected={activeTab.type === "edit"}
            aria-controls="tabpanel-edit"
            className={`${styles.tab} ${activeTab.type === "edit" ? styles.tabActive : ""}`}
          >
            {t("editTabLabel", { perfumeName: activeTab.perfumeName })}
            {activeTab.type === "edit" && (
              <span className={styles.tabIndicator} aria-hidden="true" />
            )}
          </button>
        )}

        {activeTab.type === "approve" && (
          <button
            type="button"
            role="tab"
            id="tab-approve"
            aria-selected={activeTab.type === "approve"}
            aria-controls="tabpanel-approve"
            className={`${styles.tab} ${activeTab.type === "approve" ? styles.tabActive : ""}`}
          >
            {t("approveTabLabel", { perfumeName: activeTab.perfumeName })}
            {activeTab.type === "approve" && (
              <span className={styles.tabIndicator} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {activeTab.type === "browse" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-browse"
          aria-labelledby="tab-browse"
        >
          <BrowseTab
            isAdmin={isAdmin}
            onEdit={activeEdit}
            onApprove={activeApprove}
          />
        </div>
      )}

      {activeTab.type === "add" && (
        <div
          className={`${styles.tabPanel} hide-scrollbar`}
          role="tabpanel"
          id="tabpanel-add"
          aria-labelledby="tab-add"
        >
          <AddPerfumeTab isAdmin={isAdmin} />
        </div>
      )}

      {activeTab.type === "edit" && (
        <div
          className={`${styles.tabPanel} hide-scrollbar`}
          role="tabpanel"
          id="tabpanel-edit"
          aria-labelledby="tab-edit"
        >
          <EditPerfumeTab perfumeId={activeTab.perfumeId} isAdmin={isAdmin} />
        </div>
      )}

      {activeTab.type === "approve" && (
        <div
          className={`${styles.tabPanel} hide-scrollbar`}
          role="tabpanel"
          id="tabpanel-approve"
          aria-labelledby="tab-approve"
        >
          <EditPerfumeTab
            perfumeId={activeTab.perfumeId}
            isAdmin={isAdmin}
            mode="approve"
          />
        </div>
      )}
    </div>
  );
}
