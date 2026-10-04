import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuCamera, LuPencil, LuUpload } from "react-icons/lu";
import { FieldError } from "@/ui/FieldError";
import { Spinner } from "@/ui/Spinner";
import styles from "./LogoUpload.module.css";

type LogoUploadProps = {
  /** Existing image URL (the saved logo). */
  value?: string | null;
  /**
   * Called with the picked file. May return a promise: while it is pending the
   * circle shows a spinner, and if it rejects the preview reverts to `value`.
   * Ignored when `editable` is false.
   */
  onChange?: (file: File) => unknown;
  /** false = pure preview (no input, no badge, not focusable). Defaults to true. */
  editable?: boolean;
  /** Show the spinner from the outside, e.g. a mutation's `isPending`. */
  loading?: boolean;
  error?: string;
  label?: string;
  alt?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

export function LogoUpload({
  value,
  onChange,
  editable = true,
  loading = false,
  error,
  label,
  alt = "",
  disabled,
  size = "md",
}: LogoUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [pending, setPending] = useState(false);

  // The blob preview is only valid while `value` is what it was when the file
  // was picked. Once the parent's `value` changes (e.g. after a refetch) the
  // saved image takes over automatically, with no effect needed.
  const base = value ?? null;
  const [local, setLocal] = useState<{
    url: string;
    base: string | null;
  } | null>(null);
  const preview = local && local.base === base ? local.url : base;

  // Revokes the previous blob whenever `local` changes, and on unmount.
  useEffect(() => {
    return () => {
      if (local) URL.revokeObjectURL(local.url);
    };
  }, [local]);

  const busy = loading || pending;
  const locked = Boolean(disabled) || busy;

  async function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    // Reset so picking the same file again still fires `change`.
    input.value = "";

    // Cancelling the picker fires `change` with no file in Chrome. That must
    // not clear the logo the user already chose.
    if (!file || !onChange) return;

    setLocal({ url: URL.createObjectURL(file), base });
    setPending(true);
    try {
      await onChange(file);
    } catch {
      setLocal(null);
    } finally {
      setPending(false);
    }
  }

  const badgeLabel = preview ? t("changeLogo") : t("uploadLogo");

  return (
    <div className={styles.wrap} data-size={size}>
      {label &&
        (editable ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        ) : (
          <span className={styles.label}>{label}</span>
        ))}

      <div className={styles.frame}>
        <div
          className={styles.circle}
          data-has-image={Boolean(preview)}
          data-invalid={Boolean(error)}
          data-editable={editable}
        >
          {editable && (
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              className={styles.input}
              onChange={handlePick}
              disabled={locked}
              tabIndex={-1}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
          )}

          {preview ? (
            <img src={preview} alt={alt} className={styles.preview} />
          ) : (
            <span className={styles.placeholder} aria-hidden="true">
              <LuCamera strokeWidth={1.6} />
            </span>
          )}

          {busy && (
            <span className={styles.overlay}>
              <Spinner inline size="40%" />
            </span>
          )}
        </div>

        {editable && (
          <button
            type="button"
            className={styles.badge}
            onClick={() => inputRef.current?.click()}
            disabled={locked}
            aria-label={badgeLabel}
            title={badgeLabel}
          >
            {preview ? (
              <LuPencil aria-hidden="true" />
            ) : (
              <LuUpload aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <FieldError message={error} className={styles.error} />
    </div>
  );
}

export default LogoUpload;
