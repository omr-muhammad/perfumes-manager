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
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { RoleBadge } from "./RoleBadge";
import { LabeledInput } from "@/ui/LabeledInput";
import Phone from "@/ui/Phone";
import { Button } from "@/ui/Button";
import { Spinner } from "@/ui/Spinner";

import styles from "./UserProfile.module.css";
import type { FormUser, LoggedUser } from "../types";

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

async function updateProfile(payload: FormUser) {
  console.log("updateProfile", payload);
}

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

  const [baseline, setBaseline] = useState<FormState>(() => toForm(user));
  const [form, setForm] = useState<FormState>(baseline);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const isDirty = snapshot(form) !== snapshot(baseline);

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
    // Resets the text fields only. The logo is independent and stays as chosen.
    setForm(baseline);
    setErrors({});
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!isDirty || submitting) return;

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const next: FormState = {
      ...form,
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
    };

    setSubmitting(true);
    try {
      await updateProfile({
        name: next.name,
        username: next.username,
        email: next.email,
        phone: toE164(next.phone),
      });
      setForm(next);
      setBaseline(next);
      toast.success(t("profile:toasts.profileUpdated"));
    } catch {
      toast.error(t("profile:toasts.profileUpdateFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.side}>
        {/* The logo is not part of the form: picking a file uploads it on its own. */}
        <LogoUpload
          size="xl"
          value={user.avatar}
          loading={uploadingImg}
          onChange={(file) => uploadImg({ file })}
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
          disabled={submitting}
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
          disabled={submitting}
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
          disabled={submitting}
          required
        />
        <Phone
          label={`${t("auth.fields.phone")} ${t("auth.fields.optional")}`}
          value={form.phone}
          onChange={handlePhone}
          onBlur={() => validateField("phone")}
          error={errors.phone}
          disabled={submitting}
        />

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleDiscard}
            disabled={!isDirty || submitting}
          >
            {t("profile:discard")}
          </Button>
          <Button type="submit" disabled={!isDirty || submitting}>
            {submitting && <Spinner inline size="1rem" />}
            {t("profile:update")}
          </Button>
        </div>
      </div>
    </form>
  );
}
