import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
// Adjust this to wherever FieldError actually lives in your ui/ folder.
import { FieldError } from "./FieldError";
import styles from "./LogoUpload.module.css";
import { LuUpload, LuX } from "react-icons/lu";

type LogoUploadProps = {
  /** Existing image URL, e.g. when editing a company that already has a logo. */
  value?: string | null;
  onChange: (file: File | null) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
};

export function LogoUpload({
  value,
  onChange,
  error,
  label,
  disabled,
  size = "md",
}: LogoUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const preview = localPreview ?? value ?? null;

  function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (localPreview) URL.revokeObjectURL(localPreview);

    if (!file) {
      setLocalPreview(null);
      onChange(null);
      return;
    }

    setLocalPreview(URL.createObjectURL(file));
    onChange(file);
  }

  function handleRemove() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className={styles.wrap} data-size={size}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div className={styles.row}>
        <div
          className={styles.dropzone}
          data-has-image={Boolean(preview)}
          data-invalid={Boolean(error)}
        >
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className={styles.input}
            onChange={handlePick}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          {preview ? (
            <img src={preview} alt="" className={styles.preview} />
          ) : (
            <span className={styles.placeholder}>
              <LuUpload size={20} strokeWidth={1.6} aria-hidden="true" />
              <span className={styles.placeholderText}>{t("addLogo")}</span>
            </span>
          )}
        </div>

        {preview && !disabled && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label={t("removeLogo")}
          >
            <LuX size={12} aria-hidden="true" />;
          </button>
        )}
      </div>

      <FieldError message={error} className={styles.error} />
    </div>
  );
}
