import styles from "./styles/search.module.css";

type SearchProps = {
  placeholder: string;
  text: string | undefined;
  handleChange: (value: string) => void;
};

export default function Search({
  placeholder,
  text,
  handleChange,
}: SearchProps) {
  return (
    <div className={styles.container}>
      <input
        type="search"
        value={text ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
    </div>
  );
}
