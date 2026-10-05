import { UserProfile } from "./components/UserProfile";
import { UpdatePasswordForm } from "./components/UpdatePasswordForm";
import styles from "./Profile.module.css";

/** Plain wrapper. The Outlet wrapper already provides padding and margins. */
export function Profile() {
  return (
    // `hide-scrollbar` is a global class (it also sets overflow-y: auto).
    <div className={`${styles.profile} hide-scrollbar`}>
      <UserProfile />
      <hr className={styles.divider} />
      <UpdatePasswordForm />
    </div>
  );
}

export default Profile;
