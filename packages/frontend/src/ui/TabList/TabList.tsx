import { TabButton } from "../TabButton";

export type Tab =
  | { type: "browse" }
  | { type: "add" }
  | { type: "edit" | "approve"; id: number; name: string };

interface TabListProps {
  className: string;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  browseLabel: string;
  addLabel: string;
}

export function TabList({
  className,
  activeTab,
  setActiveTab,
  browseLabel,
  addLabel,
}: TabListProps) {
  return (
    <div className={className} role="tablist">
      <TabButton
        buttonId="tab-browse"
        isActive={activeTab.type === "browse"}
        onClick={() => setActiveTab({ type: "browse" })}
        ariaControls="tabpanel-browse"
        text={browseLabel}
      />

      <TabButton
        text={addLabel}
        buttonId="tab-add"
        isActive={activeTab.type === "add"}
        ariaControls="tabpanel-add"
        onClick={() => setActiveTab({ type: "add" })}
      />

      {activeTab.type === "edit" && (
        <TabButton
          text={activeTab.name}
          buttonId="tab-edit"
          isActive={activeTab.type === "edit"}
          ariaControls="tabpanel-edit"
        />
      )}

      {activeTab.type === "approve" && (
        <TabButton
          text={activeTab.name}
          buttonId="tab-approve"
          isActive={activeTab.type === "approve"}
          ariaControls="tabpanel-approve"
        />
      )}
    </div>
  );
}
