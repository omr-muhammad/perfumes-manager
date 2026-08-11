import styles from "./styles/tab-button.module.css";

interface TabButtonProps {
  buttonId: string;
  ariaControls: string;
  isActive: boolean;
  onClick?: () => void;
  text: string;
}

export function TabButton({
  buttonId,
  ariaControls,
  isActive,
  onClick,
  text,
}: TabButtonProps) {
  const className = `${styles.tab} ${isActive ? styles.tabActive : ""}`;

  return (
    <button
      type="button"
      role="tab"
      id={buttonId}
      aria-selected={isActive}
      aria-controls={ariaControls}
      className={className}
      onClick={onClick}
    >
      {text}
      {isActive && <span className={styles.tabIndicator} aria-hidden="true" />}
    </button>
  );
}
