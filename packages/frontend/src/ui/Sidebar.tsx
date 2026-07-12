import styles from "./app-layout.module.css";
import { Logo } from "./Logo";
import MainNav from "./MainNav";

export function Sidebar({ whichNav }: { whichNav?: "shops" }) {
  return (
    <aside className={styles.sidebar}>
      <Logo />

      <MainNav whichNav={whichNav} />
    </aside>
  );
}
