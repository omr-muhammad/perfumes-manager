import { useTranslation } from "react-i18next";
import { TabButton } from "../../ui/TabButton";
import { useState } from "react";
import { loggedUserQuery } from "../Auth/hooks";
import { useQuery } from "@tanstack/react-query";

import styles from "./companies.module.css";
import { BrowseTab } from "./BrowseTab";
import { AddTab } from "./AddTab";
import { EditCompanyTab } from "./EditCompanyTab";

type CompaniesTab =
  | { type: "browse" }
  | { type: "add" }
  | { type: "edit" | "approve"; coId: number; coName: string };

export function Companies() {
  const { t } = useTranslation("companies");
  const [activeTab, setActiveTab] = useState<CompaniesTab>({
    type: "browse",
  });

  const { data: user } = useQuery(loggedUserQuery);
  const isAdmin = user?.role === "admin";

  function activeEdit(coId: number, coName: string) {
    setActiveTab({
      type: "edit",
      coId,
      coName,
    });
  }

  function activeApprove(coId: number, coName: string) {
    setActiveTab({
      type: "approve",
      coId,
      coName,
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
          text={t("browse")}
        />

        <TabButton
          text={t("add")}
          buttonId="tab-add"
          isActive={activeTab.type === "add"}
          ariaControls="tabpanel-add"
          onClick={() => setActiveTab({ type: "add" })}
        />

        {activeTab.type === "edit" && (
          <TabButton
            text={t("editTabLabel", { coName: activeTab.coName })}
            buttonId="tab-edit"
            isActive={activeTab.type === "edit"}
            ariaControls="tabpanel-edit"
          />
        )}

        {activeTab.type === "approve" && (
          <TabButton
            text={t("approveTabLabel", { coName: activeTab.coName })}
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
            coId={activeTab.coId}
            backToBrowse={activeBrowseTab}
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
            coId={activeTab.coId}
            backToBrowse={activeBrowseTab}
            mode="approve"
          />
        </div>
      )}
    </div>
  );
}
