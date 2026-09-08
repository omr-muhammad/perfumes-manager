import { Outlet } from "react-router";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import styles from "./styles/app-layout.module.css";
// import styles from "./styles/ge-app-layout.module.css";
import { ConfirmProvider } from "../contexts/ConfirmContext";

export function AppLayout({ whichNav }: { whichNav?: "shops" }) {
  return (
    <div className={styles.layout}>
      <Header />
      <Sidebar whichNav={whichNav} />

      <ConfirmProvider>
        <main className={styles.main}>
          <div className={styles.container}>
            <Outlet />
          </div>
        </main>
      </ConfirmProvider>
    </div>
  );
}
