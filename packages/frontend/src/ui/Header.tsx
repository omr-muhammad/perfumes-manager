import styles from "./app-layout.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <h1>Header</h1>
      {/* user menu, theme toggle, language switch, etc. */}
    </header>
  );
}
