import { LuFlower2 } from "react-icons/lu";
import styles from "./styles/logo.module.css";

export function Logo() {
  return (
    <div className={styles.logoWrap}>
      {/* placeholder mark — swap for the real logo whenever it's ready */}
      <LuFlower2 size={44} />
    </div>
  );
}
