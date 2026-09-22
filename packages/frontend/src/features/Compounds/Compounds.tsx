import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TabList, type Tab } from "../../ui/TabList/TabList";

import styles from "./Compounds.module.css";
import { AddCompoundTab } from "./AddCompoundTab";
import { TwoSlot } from "./TwoSlot/TwoSlot";
import { EditCompoundTab } from "./EditCompoundTab";

export function Compounds() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>({
    type: "browse",
  });

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
        <TwoSlot handleActiveTab={handleActiveTab} />
      )}
      {activeTab.type === "add" && <AddCompoundTab />}
      {activeTab.type === "edit" && (
        <EditCompoundTab compoundId={activeTab.id} />
      )}
    </div>
  );
}
