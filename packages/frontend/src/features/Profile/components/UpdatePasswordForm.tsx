import { useState, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Button } from "@/ui/Button";
import { LabeledInput } from "@/ui/LabeledInput";
import { Spinner } from "@/ui/Spinner";
import styles from "./UpdatePasswordForm.module.css";

const MIN_PASSWORD_LENGTH = 8;

/* Placeholder API action (replace with the real call later).
   Passwords are redacted on purpose, so they never reach the console. */
async function changePassword(_payload: {
  oldPassword: string;
  newPassword: string;
}) {
  console.log("changePassword", { oldPassword: "***", newPassword: "***" });
}

export function UpdatePasswordForm() {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  // Whitespace-only counts as empty. The values themselves are sent as typed,
  // because trimming a real password could silently change it.
  const canSubmit =
    oldPassword.trim() !== "" && newPassword.trim() !== "" && !submitting;

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

    setSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      toast.success(t("profile:toasts.passwordChanged"));
    } catch {
      toast.error(t("profile:toasts.passwordChangeFailed"));
    } finally {
      setSubmitting(false);
    }
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
        disabled={submitting}
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
        disabled={submitting}
      />
      <div className={styles.actions}>
        <Button type="submit" disabled={!canSubmit}>
          {submitting && <Spinner inline size="1rem" />}
          {t("profile:changePassword")}
        </Button>
      </div>
    </form>
  );
}

export default UpdatePasswordForm;
