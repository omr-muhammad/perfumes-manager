import { Outlet } from "react-router";
import {Header} from "./Header";
import {Sidebar} from "./Sidebar";
import styles from "./app-layout.module.css";

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
