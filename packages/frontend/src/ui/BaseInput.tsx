import type { InputHTMLAttributes, Ref } from "react";
import styles from "./BaseInput.module.css";

export interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Red border + aria-invalid. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/**
 * The bordered input and nothing else: no label, no error text, no state.
 * Compose it: LabeledInput adds a label + error, Phone adds a selector.
 * It does not set `autoComplete`, so callers choose (e.g. "email", "new-password").
 */
export function BaseInput({
  invalid = false,
  className,
  ref,
  ...rest
}: BaseInputProps) {
  return (
    <input
      {...rest}
      ref={ref}
      className={`${styles.input}${className ? ` ${className}` : ""}`}
      aria-invalid={invalid}
    />
  );
}

export default BaseInput;
