import { useUploadImage } from "@/hooks/useUploadImage";
import LogoUpload from "@/ui/LogoUpload";
import {
  isPhoneValid,
  parsePhone,
  phoneKey,
  toE164,
  type PhoneValue,
} from "@/utils/phone";
import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { RoleBadge } from "./RoleBadge";
import { LabeledInput } from "@/ui/LabeledInput";
import { Phone } from "@/ui/Phone";
import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";

import styles from "./UserProfile.module.css";
import type { LoggedUser } from "../types";
import { useUpdateUser } from "../hooks/useUpdateUser";

type FormState = {
  name: string;
  username: string;
  email: string;
  phone: PhoneValue;
};

type TextField = "name" | "username" | "email";
type FieldName = TextField | "phone";
type FieldErrors = Partial<Record<FieldName, string>>;

const MIN_USERNAME_LENGTH = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toForm(user: LoggedUser): FormState {
  return {
    name: user.name ?? "",
    username: user.username ?? "",
    email: user.email ?? "",
    phone: parsePhone(user.phone),
  };
}

/** Comparable snapshot: trimmed text + normalized phone. */
function snapshot(form: FormState): string {
  return JSON.stringify([
    form.name.trim(),
    form.username.trim(),
    form.email.trim(),
    phoneKey(form.phone),
  ]);
}

export function ProfileForm({ user }: { user: LoggedUser }) {
  const { t } = useTranslation();
  const { uploadImg, uploadingImg } = useUploadImage();
  const { updateUserProfile, updatingUserProfile } = useUpdateUser();

  const [form, setForm] = useState<FormState>(() => toForm(user));
  const [errors, setErrors] = useState<FieldErrors>({});

  const isDirty = snapshot(form) !== snapshot(toForm(user));

  function validate(f: FormState): FieldErrors {
    const errs: FieldErrors = {};
    const name = f.name.trim();
    const username = f.username.trim();
    const email = f.email.trim();

    if (!name) errs.name = t("auth.errors.required");

    if (!username) errs.username = t("auth.errors.required");
    else if (/\s/.test(username))
      errs.username = t("profile:errors.usernameSpaces");
    else if (username.length < MIN_USERNAME_LENGTH)
      errs.username = t("profile:errors.usernameMin", {
        min: MIN_USERNAME_LENGTH,
      });

    if (!email) errs.email = t("auth.errors.required");
    else if (!EMAIL_RE.test(email))
      errs.email = t("profile:errors.emailInvalid");

    if (!isPhoneValid(f.phone)) errs.phone = t("profile:errors.phoneInvalid");

    return errs;
  }

  function clearError(field: FieldName) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }

  function validateField(field: FieldName) {
    const message = validate(form)[field];
    setErrors((prev) => ({ ...prev, [field]: message }));
  }

  function handleText(field: TextField) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      clearError(field);
    };
  }

  function handlePhone(phone: PhoneValue) {
    setForm((prev) => ({ ...prev, phone }));
    clearError("phone");
  }

  function handleDiscard() {
    setForm(toForm(user));
    setErrors({});
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!isDirty || updatingUserProfile) return;

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const updates = {
      ...form,
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: toE164(form.phone),
    };

    updateUserProfile(updates);
  }

  function handleLogo(url: string) {
    updateUserProfile({ avatar: url });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.side}>
        <LogoUpload
          size="xl"
          value={user.avatar}
          loading={uploadingImg}
          onChange={(file) => uploadImg({ file, action: handleLogo })}
        />
        <RoleBadge role={user.role} />
      </div>

      <div className={styles.fields}>
        <LabeledInput
          name="name"
          label={t("auth.fields.name")}
          labelPosition="beside"
          autoComplete="name"
          value={form.name}
          onChange={handleText("name")}
          onBlur={() => validateField("name")}
          error={errors.name}
          disabled={updatingUserProfile}
          required
        />
        <LabeledInput
          name="username"
          label={t("auth.fields.username")}
          labelPosition="beside"
          autoComplete="username"
          value={form.username}
          onChange={handleText("username")}
          onBlur={() => validateField("username")}
          error={errors.username}
          disabled={updatingUserProfile}
          required
        />
        <LabeledInput
          name="email"
          type="email"
          label={t("auth.fields.email")}
          labelPosition="beside"
          autoComplete="email"
          value={form.email}
          onChange={handleText("email")}
          onBlur={() => validateField("email")}
          error={errors.email}
          disabled={updatingUserProfile}
          required
        />
        <Phone
          label={`${t("auth.fields.phone")} ${t("auth.fields.optional")}`}
          value={form.phone}
          onChange={handlePhone}
          onBlur={() => validateField("phone")}
          error={errors.phone}
          disabled={updatingUserProfile}
        />

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleDiscard}
            disabled={!isDirty || updatingUserProfile}
          >
            {t("profile:discard")}
          </Button>
          <Button type="submit" disabled={!isDirty || updatingUserProfile}>
            {updatingUserProfile && <Spinner inline size="1rem" />}
            {t("profile:update")}
          </Button>
        </div>
      </div>
    </form>
  );
}
