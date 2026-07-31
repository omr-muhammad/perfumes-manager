import { useId, useState } from "react";
import type { ChangeEvent, FocusEvent, InputHTMLAttributes } from "react";
import styles from "./styles/labeled-input.module.css";

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
  /** Text shown as the label, floats above the input on focus or when filled. */
  label: string;
  /** Optional error message — shows red state + helper text below the input. */
  error?: string;
}

/**
 * DynamicLabelInput
 * Fully controlled — this component holds no data state.
 * The only local state is `isFocused`, which is transient UI state
 * (whether the label should float), not form data, so it stays here.
 */
export function LabeledInput({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  disabled,
  onFocus,
  onBlur,
  className,
  ...rest
}: DynamicLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const reactId = useId();
  const inputId = rest.id ?? `dli-${name}-${reactId}`;
  const errorId = `${inputId}-error`;

  const isFloating = isFocused || value.length > 0;

  function handleFocus(e: FocusEvent<HTMLInputElement>) {
    setIsFocused(true);
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    setIsFocused(false);
    onBlur?.(e);
  }

  return (
    <div className={`${styles.dliGroup}${className ? ` ${className}` : ""}`}>
      <input
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
        placeholder=" "
        className={styles.dliInput}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <label
        htmlFor={inputId}
        className={`${styles.dliLabel}${isFloating ? ` ${styles.dliLabelFloating}` : ""}`}
      >
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
