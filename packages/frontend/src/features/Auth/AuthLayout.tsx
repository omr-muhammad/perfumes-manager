import { Outlet } from "react-router";
import { ThemeToggler } from "../../ui/ThemeToggler";
import styles from "./authlayout.module.css";
import { Logo } from "../../ui/Logo";

export function AuthLayout() {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <ThemeToggler />
      </header>

      <Logo />

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
