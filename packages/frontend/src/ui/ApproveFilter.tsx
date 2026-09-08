import styles from "./styles/approve-filter.module.css";

type Approve = boolean | undefined;
interface ApproveFilterProps {
  approved: Approve;
  handleActive: (value: Approve) => void;
  approvedTxt: string;
  pendingTxt: string;
}

export default function ApproveFilter({
  approved,
  handleActive,
  approvedTxt,
  pendingTxt,
}: ApproveFilterProps) {
  return (
    <div
      className={`${styles.filter} ${
        approved === true
          ? styles.approved
          : approved === false
            ? styles.pending
            : styles.none
      }`}
    >
      <button
        type="button"
        className={styles.option}
        onClick={() => handleActive(approved === true ? undefined : true)}
      >
        {approvedTxt}
      </button>

      <button
        type="button"
        className={styles.option}
        onClick={() => handleActive(approved === false ? undefined : false)}
      >
        {pendingTxt}
      </button>
    </div>
  );
}
