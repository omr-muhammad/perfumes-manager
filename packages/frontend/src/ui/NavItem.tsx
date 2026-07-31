import type { ReactElement } from "react";
import { NavLink } from "react-router";
import styles from "./styles/nav-item.module.css";
import { useTranslation } from "react-i18next";

export interface NavItemProps {
  /** Route path, passed straight to react-router's `to` */
  to: string;
  /** Icon element, e.g. <HiOutlineSparkles /> — rendered aria-hidden */
  icon: ReactElement;
  label: string;
  /** Forwarded to NavLink's `end` prop for exact-match highlighting */
  end?: boolean;
}

export default function NavItem({
  to,
  icon,
  label,
  end = false,
}: NavItemProps) {
  const { t } = useTranslation();
  return (
    <li className={styles.item}>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          isActive ? `${styles.link} ${styles.active}` : styles.link
        }
      >
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.label}>{t(`sidebar.${label}`)}</span>
      </NavLink>
    </li>
  );
}
