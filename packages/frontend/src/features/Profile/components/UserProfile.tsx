import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Spinner } from "@/ui/Spinner";
import styles from "./UserProfile.module.css";
import { loggedUserQuery } from "@/features/Auth/hooks/useUser";
import { ProfileForm } from "./ProfileForm";

export function UserProfile() {
  const { t } = useTranslation();
  const { data: user, isPending, isError } = useQuery(loggedUserQuery);

  if (isPending) {
    return (
      <div className={styles.state}>
        <Spinner />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <p className={styles.state} role="alert">
        {t("profile:errors.loadFailed")}
      </p>
    );
  }

  return <ProfileForm user={user} />;
}
