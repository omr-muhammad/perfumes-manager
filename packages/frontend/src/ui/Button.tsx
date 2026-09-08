import React from "react";
import styles from "./styles/button.module.css";

export type ButtonSize = "small" | "mid" | "large";
export type ButtonVariant = "primary" | "secondary" | "delete";

export interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset";
  ref?: React.Ref<HTMLButtonElement>;
}

export function Button({
  size = "mid",
  variant = "primary",
  type = "button",
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.btn,
    styles[`size-${size}`],
    styles[`variant-${variant}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

export function getButtonVariantClassName(
  variant: ButtonVariant = "primary",
): string {
  return styles[`variant-${variant}`];
}

export default Button;
