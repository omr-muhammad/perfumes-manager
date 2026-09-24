import { useState } from "react";
import { loggedUserQuery } from "../Auth/hooks";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BrowseTab } from "./BrowseTab";
import styles from "./perfumes.module.css";
import { AddPerfumeTab } from "./AddPerfumeTab";
import { EditPerfumeTab } from "./EditPerfumeTab";
import { TabButton } from "../../ui/TabButton";
import { useLocation } from "react-router";
import type { Tab } from "../../ui/TabList/TabList";

export function Perfumes() {
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

  function activeEdit(id: number, name: string) {
    setActiveTab({
      type: "edit",
      id,
      name,
    });
  }

  function activeApprove(id: number, name: string) {
    setActiveTab({
      type: "approve",
      id,
      name,
    });
  }

  function activeBrowseTab() {
    setActiveTab({ type: "browse" });
  }

  return (
    <div>
      <div className={styles.tabList} role="tablist">
        <TabButton
          buttonId="tab-browse"
          isActive={activeTab.type === "browse"}
          onClick={() => setActiveTab({ type: "browse" })}
          ariaControls="tabpanel-browse"
          text={t("perfumes:browse")}
        />

        <TabButton
          text={t("perfumes:add")}
          buttonId="tab-add"
          isActive={activeTab.type === "add"}
          ariaControls="tabpanel-add"
          onClick={() => setActiveTab({ type: "add" })}
        />

        {activeTab.type === "edit" && (
          <TabButton
            text={t("perfumes:editTabLabel", {
              perfumeName: activeTab.name,
            })}
            buttonId="tab-edit"
            isActive={activeTab.type === "edit"}
            ariaControls="tabpanel-edit"
          />
        )}

        {activeTab.type === "approve" && (
          <TabButton
            text={t("perfumes:approveTabLabel", {
              perfumeName: activeTab.name,
            })}
            buttonId="tab-approve"
            isActive={activeTab.type === "approve"}
            ariaControls="tabpanel-approve"
          />
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
          <EditPerfumeTab
            perfumeId={activeTab.id}
            isAdmin={isAdmin}
            backToBrowse={activeBrowseTab}
          />
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
            perfumeId={activeTab.id}
            isAdmin={isAdmin}
            mode="approve"
            backToBrowse={activeBrowseTab}
          />
        </div>
      )}
    </div>
  );
}
