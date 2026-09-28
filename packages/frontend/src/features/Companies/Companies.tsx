import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";

import { BrowseCompanies } from "./tabs/BrowseCompanies";
import { AddCompany } from "./tabs/AddCompany";
import { EditCompany } from "./tabs/EditCompany";
import { TabList, type Tab } from "../../ui/TabList/TabList";

import { loggedUserQuery } from "../Auth/hooks/useUser";

import styles from "./Companies.module.css";

export function Companies() {
  const location = useLocation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (location.state?.activeTab === "add") return { type: "add" };

    return {
      type: "browse",
    };
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
          <BrowseCompanies
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
          <AddCompany />
        </div>
      )}

      {activeTab.type === "edit" && (
        <div
          className={styles.tabPanel}
          role="tabpanel"
          id="tabpanel-edit"
          aria-labelledby="tab-edit"
        >
          <EditCompany
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
          <EditCompany
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
