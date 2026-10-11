import { useTranslation } from "react-i18next";

import { SelectOne } from "@/ui/SelectOne";

import styles from "./Settings.module.css";
import { useId } from "react";
import { useUpdateUser } from "../Profile/hooks/useUpdateUser";
import { useQuery } from "@tanstack/react-query";
import { loggedUserQuery } from "../Auth/hooks/useUser";
import type { UserLanguage } from "../Profile/types";

export function Settings() {
  const { t, i18n } = useTranslation();
  const { data: user } = useQuery(loggedUserQuery);
  const { updateUserProfile } = useUpdateUser({ silent: true });
  const selectId = useId();

  function changeLanguage(language: UserLanguage) {
    i18n.changeLanguage(language ?? "");
    updateUserProfile({ language });
  }

  return (
    <>
      <div>
        <div className={styles.field}>
          <label htmlFor={selectId} className={styles.label}>
            {t("settings.language") + ":"}
          </label>

          <SelectOne
            value={user?.language ?? i18n.resolvedLanguage ?? ""}
            // @ts-expect-error
            handleSelect={changeLanguage}
            placeholder={t("settings.selectLanguage")}
            options={[
              { value: "ar", label: "العربية" },
              { value: "en", label: "English" },
            ]}
          />
        </div>
      </div>
    </>
  );
}
