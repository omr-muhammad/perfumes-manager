import { useState } from "react";
import { loggedUserQuery } from "../Auth/hooks";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BrowseTab } from "./BrowseTab";
import styles from "./perfumes.module.css";
import { AddPerfumeTab } from "./AddPerfumeTab";

type PerfumesTab = "browse" | "add";

export function Perfumes() {
  const { t } = useTranslation("perfumes");
  const [activeTab, setActiveTab] = useState<PerfumesTab>("browse");

  const { data: user } = useQuery(loggedUserQuery);
  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className={styles.tabList} role="tablist">
        <button
          type="button"
          role="tab"
          id="tab-browse"
          aria-selected={activeTab === "browse"}
          aria-controls="tabpanel-browse"
          className={`${styles.tab} ${activeTab === "browse" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("browse")}
        >
          {t("browse")}
          {activeTab === "browse" && (
            <span className={styles.tabIndicator} aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          role="tab"
          id="tab-add"
          aria-selected={activeTab === "add"}
          aria-controls="tabpanel-add"
          className={`${styles.tab} ${activeTab === "add" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("add")}
        >
          {t("add")}
          {activeTab === "add" && (
            <span className={styles.tabIndicator} aria-hidden="true" />
          )}
        </button>
      </div>

      {activeTab === "browse" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-browse"
          aria-labelledby="tab-browse"
        >
          <BrowseTab isAdmin={isAdmin} />
        </div>
      )}

      {activeTab === "add" && (
        <div
          className={`${styles.tabPanel} hide-scrollbar`}
          role="tabpanel"
          id="tabpanel-add"
          aria-labelledby="tab-add"
        >
          <AddPerfumeTab isAdmin={isAdmin} />
        </div>
      )}
    </div>
  );
}
