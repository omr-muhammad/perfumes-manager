import { Outlet } from "react-router";
import { LuFlower2 } from "react-icons/lu";
import { ThemeToggler } from "../../ui/ThemeToggler";
import styles from "./authlayout.module.css";

export function AuthLayout() {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <ThemeToggler />
      </header>

      <div className={styles.logoWrap}>
        {/* placeholder mark — swap for the real logo whenever it's ready */}
        <LuFlower2 size={44} />
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
