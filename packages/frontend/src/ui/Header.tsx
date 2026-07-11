import styles from "./app-layout.module.css";
import { useLogout } from "../features/Auth/hooks";
import { Spinner } from "./Spinner";
import { CiLogout, CiUser } from "react-icons/ci";
import { Link } from "react-router";

export function Header() {
  const { logout, loggingOut } = useLogout();

  return (
    <header className={styles.header}>
      <Link to="/dashboard/profile">
        <CiUser size={22} />
      </Link>
      <button onClick={() => logout()} disabled={loggingOut}>
        {loggingOut ? <Spinner size="1rem" /> : <CiLogout className={styles.logoutIcon} size={22} />}
      </button>
    </header>
  );
}
