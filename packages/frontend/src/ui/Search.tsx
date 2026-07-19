import { useTranslation } from "react-i18next";
import styles from "./styles/search.module.css";

type SearchProps = {
  placeholder?: string;
  text: string | undefined;
  handleChange: (value: string) => void;
  nsFile?: string;
};

export default function Search({
  placeholder = "search",
  text,
  handleChange,
  nsFile,
}: SearchProps) {
  const { t } = useTranslation(nsFile);

  return (
    <div className={styles.container}>
      <input
        type="search"
        value={text ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={t(placeholder)}
        className={styles.input}
      />
    </div>
  );
}
