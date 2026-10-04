import { Outlet } from "react-router";

import { ThemeToggler } from "@/ui/ThemeToggler";
import { Logo } from "@/ui/Logo";

import styles from "./AuthLayout.module.css";

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
