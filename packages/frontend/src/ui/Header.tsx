import { HiLogout } from "react-icons/hi";
import styles from "./app-layout.module.css";
import { useLogout } from "../features/Auth/hooks";

export function Header() {
  const { logout, loggingOut } = useLogout();

  return (
    <header className={styles.header}>

      <button onClick={() => logout()} disabled={loggingOut}>
        <HiLogout />
      </button>
    </header>
  );
}
