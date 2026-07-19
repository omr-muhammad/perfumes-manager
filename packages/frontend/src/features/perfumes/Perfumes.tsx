import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrowseTab } from "./BrowseTab";
import styles from "./perfumes.module.css";

type PerfumesTab = "browse" | "add";

export function Perfumes() {
  const { t } = useTranslation("perfumes");
  const [activeTab, setActiveTab] = useState<PerfumesTab>("browse");

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
          <BrowseTab />
        </div>
      )}

      {activeTab === "add" && (
        <div
          className="hide-scrollbar"
          role="tabpanel"
          id="tabpanel-add"
          aria-labelledby="tab-add"
        >
          <h1>{t("addNewPerfume")}</h1>
        </div>
      )}
    </div>
  );
}
