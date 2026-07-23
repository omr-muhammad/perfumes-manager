import { useId, useState } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  FocusEvent,
  TextareaHTMLAttributes,
} from "react";
import styles from "./styles/labeled-textarea.module.css";

interface LabeledTextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "name"
> {
  /** Controlled value — owned and updated by the parent. */
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  label: string;
  error?: string;
  /** Fixed height (CSS length, e.g. "160px"). Keeps sibling fields aligned in a grid row. Defaults to 120px. */
  height?: string;
}

const DEFAULT_HEIGHT = "120px";

/**
 * LabeledTextarea
 * Same floating-label pattern as DynamicLabelInput, fully controlled.
 * Height is fixed (not user-resizable) so two of these side by side in a
 * grid row stay the same size regardless of content — adjust via `height`.
 */
export default function LabeledTextarea({
  name,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  height,
  onFocus,
  onBlur,
  className,
  style,
  ...rest
}: LabeledTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const reactId = useId();
  const textareaId = rest.id ?? `lt-${name}-${reactId}`;
  const errorId = `${textareaId}-error`;

  const isFloating = isFocused || value.length > 0;

  function handleFocus(e: FocusEvent<HTMLTextAreaElement>) {
    setIsFocused(true);
    onFocus?.(e);
  }

  function handleBlur(e: FocusEvent<HTMLTextAreaElement>) {
    setIsFocused(false);
    onBlur?.(e);
  }

  const mergedStyle: CSSProperties = {
    height: height ?? DEFAULT_HEIGHT,
    ...style,
  };

  return (
    <div className={`${styles.ltGroup}${className ? ` ${className}` : ""}`}>
      <textarea
        {...rest}
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        disabled={disabled}
        placeholder=" "
        className={styles.ltTextarea}
        style={mergedStyle}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <label
        htmlFor={textareaId}
        className={`${styles.ltLabel}${isFloating ? ` ${styles.ltLabelFloating}` : ""}`}
      >
        {label}
        {required && <span className={styles.ltRequired}> *</span>}
      </label>
      {error && (
        <span id={errorId} className={styles.ltError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
