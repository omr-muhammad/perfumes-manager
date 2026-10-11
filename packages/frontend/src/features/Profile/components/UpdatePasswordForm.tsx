import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/ui/Button";
import { LabeledInput } from "@/ui/LabeledInput";
import { Spinner } from "@/ui/Spinner";
import styles from "./UpdatePasswordForm.module.css";
import { useUpdatePassword } from "../hooks/useUpdatePassword";

const MIN_PASSWORD_LENGTH = 8;

export function UpdatePasswordForm() {
  const { t } = useTranslation();
  const { updatePassword, updatingPassword } = useUpdatePassword();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState<string>();

  const canSubmit =
    oldPassword.trim() !== "" && newPassword.trim() !== "" && !updatingPassword;

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setNewPasswordError(
        t("profile:errors.newPasswordMin", { min: MIN_PASSWORD_LENGTH }),
      );
      return;
    }
    if (newPassword === oldPassword) {
      setNewPasswordError(t("profile:errors.newPasswordSame"));
      return;
    }

    updatePassword({ oldPw: oldPassword, newPw: newPassword });
    setOldPassword("");
    setNewPassword("");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <LabeledInput
        name="oldPassword"
        type="password"
        label={t("profile:fields.oldPassword")}
        autoComplete="current-password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        disabled={updatingPassword}
      />
      <LabeledInput
        name="newPassword"
        type="password"
        label={t("profile:fields.newPassword")}
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setNewPasswordError(undefined);
        }}
        error={newPasswordError}
        disabled={updatingPassword}
      />
      <div className={styles.actions}>
        <Button type="submit" disabled={!canSubmit}>
          {updatingPassword && <Spinner inline size="1rem" />}
          {t("profile:changePassword")}
        </Button>
      </div>
    </form>
  );
}

export default UpdatePasswordForm;
