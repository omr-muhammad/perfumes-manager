import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import styles from "./styles/app-layout.module.css";

export function AppLayout({ whichNav }: { whichNav?: "shops" }) {
  return (
    <div className={styles.layout}>
      <Header />
      <Sidebar whichNav={whichNav} />
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
