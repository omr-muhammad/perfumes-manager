import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
// Adjust this to wherever FieldError actually lives in your ui/ folder.
import { FieldError } from "./FieldError";
import styles from "./styles/logo-upload.module.css";

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
              <UploadIcon />
              <span className={styles.placeholderText}>
                {t("common:addLogo", "Add logo")}
              </span>
            </span>
          )}
        </div>

        {preview && !disabled && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={handleRemove}
            aria-label={t("common:removeLogo", "Remove logo")}
          >
            <RemoveIcon />
          </button>
        )}
      </div>

      <FieldError message={error} className={styles.error} />
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
