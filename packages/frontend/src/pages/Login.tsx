import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import styles from "../features/Auth/authlayout.module.css";
import { Link } from "react-router";
import { useLogin } from "../features/Auth/hooks";

export function Login() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, loggingIn } = useLogin();

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    login({ ...form, keepLogin: false });
  };

  return (
    <>
      <h3 className={styles.formHeader}>{t("auth.login.heading")}</h3>

      <p className={styles.formSubtitle}>
        {t("auth.login.subtitle")}{" "}
        <Link to="../signup" className={styles.subtitleLink}>
          {t("auth.login.subtitleLink")}
        </Link>
      </p>

      <form className={styles.card} onSubmit={handleSubmit}>
        {/* <div className={styles.row}> */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {t("auth.fields.email")}
          </label>
          <input
            className={styles.input}
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>


        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            {t("auth.fields.password")}
          </label>
          <input
            className={styles.input}
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </div>
        {/* </div> */}

        <button
          className={styles.button}
          type="submit"
          disabled={loggingIn}
        >
          {t("auth.login.submit")}
        </button>
      </form>
    </>
  );
}
