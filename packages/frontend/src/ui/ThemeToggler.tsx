import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../contexts/ThemeContext";
import styles from "./themetoggler.module.css";

export function ThemeToggler({ wrap = true }: { wrap?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? LuSun : LuMoon;

  if (!wrap) return <Icon size={20} onClick={toggleTheme} />

  return (
    <button
      className={styles.toggler}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <Icon size={20} />
    </button>
  );
}
