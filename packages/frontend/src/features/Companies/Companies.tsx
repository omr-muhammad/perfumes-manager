import { useTranslation } from "react-i18next";
import { useState } from "react";
import { loggedUserQuery } from "../Auth/hooks";
import { useQuery } from "@tanstack/react-query";

import styles from "./companies.module.css";
import { BrowseTab } from "./BrowseTab";
import { AddTab } from "./AddTab";
import { EditCompanyTab } from "./EditCompanyTab";
import { TabList, type Tab } from "../../ui/TabList/TabList";

export function Companies() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>({
    type: "browse",
  });

  const { data: user } = useQuery(loggedUserQuery);
  const isAdmin = user?.role === "admin";

  function handleTabActivation(tab: Tab) {
    setActiveTab(tab);
  }

  return (
    <div>
      <TabList
        className={styles.tabList}
        activeTab={activeTab}
        setActiveTab={handleTabActivation}
        browseLabel={t("panelBtns.browse")}
        addLabel={t("panelBtns.add")}
      />

      {activeTab.type === "browse" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-browse"
          aria-labelledby="tab-browse"
        >
          <BrowseTab
            isAdmin={isAdmin}
            handleTabActivation={handleTabActivation}
          />
        </div>
      )}

      {activeTab.type === "add" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-browse"
          aria-labelledby="tab-browse"
        >
          <AddTab />
        </div>
      )}

      {activeTab.type === "edit" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-edit"
          aria-labelledby="tab-edit"
        >
          <EditCompanyTab
            isAdmin={isAdmin}
            coId={activeTab.id}
            backToBrowse={() => handleTabActivation({ type: "browse" })}
          />
        </div>
      )}

      {activeTab.type === "approve" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-approve"
          aria-labelledby="tab-approve"
        >
          <EditCompanyTab
            isAdmin={isAdmin}
            coId={activeTab.id}
            backToBrowse={() => handleTabActivation({ type: "browse" })}
            mode="approve"
          />
        </div>
      )}
    </div>
  );
}
