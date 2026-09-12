import { useTranslation } from "react-i18next";
import { useState } from "react";
import { TabList, type Tab } from "../../ui/TabList/TabList";

import styles from "./Compounds.module.css";
import { BrowseCompounds } from "./Browse/BrowseCompounds";

export function Compounds() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>({
    type: "browse",
  });

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

      {activeTab.type === "browse" && <BrowseCompounds />}
    </div>
  );
}
