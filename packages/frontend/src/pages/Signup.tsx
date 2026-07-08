import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import styles from "../features/Auth/authlayout.module.css";
import { Link } from "react-router";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useSignup } from "../features/Auth/useSignup";

export function Signup() {
  const { t } = useTranslation();
  const { signup, signingUp } = useSignup();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validate(data: typeof form) {
    const newErrors: Record<string, string> = {};

    if (!data.name.trim()) newErrors.name = t("auth.errors.required");
    else if (data.name.length > 50)
      newErrors.name = t("auth.errors.maxLength", { max: 50 });

    if (!data.username.trim()) newErrors.username = t("auth.errors.required");
    else if (data.username.length > 50)
      newErrors.username = t("auth.errors.maxLength", { max: 50 });

    if (!data.email.trim()) newErrors.email = t("auth.errors.required");
    else if (data.email.length > 100)
      newErrors.email = t("auth.errors.maxLength", { max: 100 });

    if (data.phone.length > 50)
      newErrors.phone = t("auth.errors.maxLength", { max: 50 });

    if (!data.password) newErrors.password = t("auth.errors.required");

    if (!data.confirmPassword)
      newErrors.confirmPassword = t("auth.errors.required");
    else if (data.password !== data.confirmPassword)
      newErrors.confirmPassword = t("auth.errors.passwordMismatch");

    return newErrors;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear the error as soon as the user start editing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const { confirmPassword, ...rest } = form;

    signup({ user: rest, keepLogin: false });
  }

  return (
    <>
      <h3 className={styles.formHeader}>{t("auth.signup.heading")}</h3>

      <p className={styles.formSubtitle}>
        {t("auth.signup.subtitle")}{" "}
        <Link to="../login" className={styles.subtitleLink}>
          {t("auth.signup.subtitleLink")}
        </Link>
      </p>

      <form
        className={`${styles.card} ${styles.cardWide}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              {t("auth.fields.name")}
            </label>
            <input
              className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              maxLength={50}
              required
            />
            {errors.name && (
              <span className={styles.fieldError}>{errors.name}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              {t("auth.fields.username")}
            </label>
            <input
              className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              maxLength={50}
              required
            />
            {errors.username && (
              <span className={styles.fieldError}>{errors.username}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {t("auth.fields.email")}
            </label>
            <input
              className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              maxLength={100}
              required
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              {t("auth.fields.phone")}{" "}
              <span className={styles.optional}>
                {t("auth.fields.optional")}
              </span>
            </label>
            <input
              className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              maxLength={50}
            />
            {errors.phone && (
              <span className={styles.fieldError}>{errors.phone}</span>
            )}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t("auth.fields.password")}
            </label>
            <div className={styles.passwordWrap}>
              <input
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              {t("auth.fields.confirmPassword")}
            </label>
            <div className={styles.passwordWrap}>
              <input
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                minLength={8}
                required
              />
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className={styles.fieldError}>
                {errors.confirmPassword}
              </span>
            )}
          </div>
        </div>

        <button className={styles.button} type="submit" disabled={signingUp}>
          {t("auth.signup.submit")}
        </button>
      </form>
    </>
  );
}
