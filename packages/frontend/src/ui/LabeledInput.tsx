import { useId, useState } from "react";
import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from "react";
import { BaseInput } from "@/ui/BaseInput";
import styles from "./LabeledInput.module.css";

interface DynamicLabelInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "name"
> {
  /** Controlled value — owned and updated by the parent. */
  value: string;
  /** Standard change handler — parent decides how state updates. */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Input `name` attribute, passed by the parent (e.g. for forms / formik / react-hook-form). */
  name: string;
  /** Text shown as the label. */
  label: string;
  /** Optional error message — shows red state + helper text below the input. */
  error?: string;
  /**
   * "floating" (default): label sits inside the field and floats up on focus / when filled.
   * "beside": static label in its own column before the input. Set `--label-width`
   * on a parent to align the labels of several fields (default 10rem).
   */
  labelPosition?: "floating" | "beside";
}

/**
 * DynamicLabelInput
 * Fully controlled — this component holds no data state.
 * The only local state is `isFocused`, which is transient UI state
 * (whether the label should float), not form data, so it stays here.
 * The input itself is BaseInput; this component adds the label + error.
 */
export function LabeledInput({
  name,
  label,
  value,
  onChange,
  error,
  labelPosition = "floating",
  type = "text",
  required,
  disabled,
  placeholder,
  onFocus,
  onBlur,
  className,
  ...rest
}: DynamicLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const reactId = useId();
  const inputId = rest.id ?? `dli-${name}-${reactId}`;
  const errorId = `${inputId}-error`;

  const beside = labelPosition === "beside";
  const isFloating = !beside && (isFocused || value.length > 0);

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    onBlur?.(e);
  }

  const labelClass = beside
    ? styles.dliLabelBeside
    : `${styles.dliLabel}${isFloating ? ` ${styles.dliLabelFloating}` : ""}`;

  return (
    <div
      className={`${styles.dliGroup}${className ? ` ${className}` : ""}`}
      data-label-position={labelPosition}
    >
      <BaseInput
        {...rest}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        // The floating label needs a blank placeholder; "beside" can use a real one.
        placeholder={beside ? placeholder : " "}
        invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <label htmlFor={inputId} className={labelClass}>
        {label}
        {required && <span className={styles.dliRequired}> *</span>}
      </label>
      {error && (
        <span id={errorId} className={styles.dliError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
