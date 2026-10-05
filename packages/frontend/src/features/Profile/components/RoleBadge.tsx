import { useTranslation } from "react-i18next";

import styles from "./UserProfile.module.css";
import { Button } from "@/ui/Button";

export function RoleBadge({ role }: { role: string }) {
  const { t } = useTranslation();
  const canPromote = role !== "admin" && role !== "owner";

  return (
    <div className={styles.role}>
      <span className={styles.roleBadge}>
        {t(`profile:roles.${role}`, { defaultValue: role })}
      </span>
      {canPromote && (
        <Button
          size="small"
          variant="secondary"
          onClick={() => console.log("User promoted.")}
        >
          {t("profile:promote")}
        </Button>
      )}
    </div>
  );
}
