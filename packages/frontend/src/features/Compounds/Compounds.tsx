import { useTranslation } from "react-i18next";
import { useState } from "react";

import { AddCompoundTab } from "./tabs/AddCompound";
import { EditCompoundTab } from "./tabs/EditCompound";
import { BrowseCompounds } from "./tabs/BrowseCompounds";

import styles from "./Compounds.module.css";

import { TabList, type Tab } from "../../ui/TabList/TabList";

export function Compounds() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<Tab>({ type: "browse" });

  function handleActiveTab(tab: Tab) {
    setActiveTab(tab);
  }

  return (
    <div>
      <TabList
        className={styles.tabList}
        activeTab={activeTab}
        setActiveTab={handleActiveTab}
        browseLabel={t("panelBtns.browse")}
        addLabel={t("panelBtns.add")}
      />

      {activeTab.type === "browse" && (
        <BrowseCompounds handleActiveTab={handleActiveTab} />
      )}
      {activeTab.type === "add" && (
        <AddCompoundTab partialData={activeTab.data} />
      )}
      {activeTab.type === "edit" && (
        <EditCompoundTab compoundId={activeTab.id} />
      )}
    </div>
  );
}
