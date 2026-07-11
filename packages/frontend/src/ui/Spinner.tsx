import styles from './spinner.module.css';

export interface SpinnerProps {
  /**
   * Diameter of the spinner. Defaults to the original 6.4rem full-page size.
   * Pass something small (e.g. "1.6rem") for inline use next to text or in a button.
   */
  size?: string;
  /**
   * Set true for inline contexts (buttons, inside text) — disables the
   * auto-centering margin so it doesn't disrupt surrounding layout.
   * Defaults to false (centered, full-page style).
   */
  inline?: boolean;
}

export function Spinner({ size = '6.4rem', inline = false }: SpinnerProps) {
  return (
    <div
      className={inline ? styles.spinner : `${styles.spinner} ${styles.centered}`}
      style={{ width: size }}
      role="status"
      aria-label="Loading"
    />
  );
}
