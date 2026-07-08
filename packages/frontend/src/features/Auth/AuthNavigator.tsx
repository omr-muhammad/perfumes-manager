import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import styles from "./auth-navigator.module.css";

export function AuthNavigator() {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<"login" | "signup" | null>(null);

  return (
    <div className={styles.wrap} data-hover={hovered}>
      <Link
        to="login"
        data-role="login"
        className={styles.side}
        onMouseEnter={() => setHovered("login")}
        onMouseLeave={() => setHovered(null)}
      >
        {t("auth.nav.login")}
      </Link>

      <div className={styles.divider} aria-hidden="true" />

      <Link
        to="signup"
        data-role="signup"
        className={styles.side}
        onMouseEnter={() => setHovered("signup")}
        onMouseLeave={() => setHovered(null)}
      >
        {t("auth.nav.signup")}
      </Link>
    </div>
  );
}
