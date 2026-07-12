import styles from "./app-layout.module.css";
import { loggedUserQuery, useLogout } from "../features/Auth/hooks";
import { Spinner } from "./Spinner";
import { Link } from "react-router";
import { ThemeToggler } from "./ThemeToggler";
import { LuLogOut, LuUser } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";

export function Header() {
  const { logout, loggingOut } = useLogout();
  const { data: user } = useQuery(loggedUserQuery)

  return (
    <header className={styles.header}>
      {
        user !== undefined &&
        <div className={styles.wrapper}>
          <img className={styles.avatar} src="/default-avatar.png" alt={`Avatar of ${user.name}`} />
          <span>{user.username}</span>
        </div>
      }

      <ul className={styles.headerMenu}>
        <li>
          <Link to="/dashboard/profile">
            <LuUser size={20} />
          </Link>
        </li>
        <li>
          <ThemeToggler wrap={false} />
        </li>
        <li>
          {loggingOut ?
            <Spinner size="1rem" />
            :
            <LuLogOut onClick={() => logout()} className={styles.logoutIcon} size={20} />
          }
        </li>
      </ul>
    </header>
  );
}
