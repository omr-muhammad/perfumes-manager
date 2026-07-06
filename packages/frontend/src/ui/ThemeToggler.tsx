import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../contexts/ThemeContext";
import styles from "./themetoggler.module.css";

export function ThemeToggler() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.toggler}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <LuSun size={20} /> : <LuMoon size={20} />}
    </button>
  );
}
