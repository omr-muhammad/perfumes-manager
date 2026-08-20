import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./companies.module.css";
import type { Company } from "../../api/companiesAPI";
import { LabeledInput } from "../../ui/LabeledInput";
import { useTranslation } from "react-i18next";
import { TypeFilter } from "../../ui/TypeFilter";
import DisplayResult from "../../ui/DisplayResult";
import { FieldError } from "../../ui/FieldError";
import { LogoUpload } from "../../ui/LogoUpload";
import i18n from "../../i18";
import { getLocalizedCountries } from "../../utils/countries";
import Button from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import { useUploadLogo } from "./hooks";

const BASE_IMG_URL = import.meta.env.VITE_BASE_CLOUDINARY_URL;

export type FormCompany = Omit<
  Company,
  "createdAt" | "updatedAt" | "id" | "approved"
>;

export type FormErrors = Partial<
  Record<"name" | "hqCountryCode" | "type" | "logo" | "root", string>
>;

type CoFormProps = {
  initData?: FormCompany;
  approve?: boolean;
  onSubmit: (newCo: FormCompany) => void;
  isSubmitting: boolean;
  isAdmin: boolean;
  // Field-keyed errors from a failed API call, merged on top of local
  // validation so the caller doesn't need to know what's already showing.
  serverErrors?: FormErrors;
};

type EmptyCompany = {
  name: string;
  type: Company["type"];
  hqCountryCode: string;
  logo: string;
};

const emptyCompany: EmptyCompany = {
  name: "",
  type: "global" as const,
  hqCountryCode: "",
  logo: "",
};

export function CoForm({
  initData,
  onSubmit,
  isSubmitting,
  isAdmin,
  approve,
  serverErrors,
}: CoFormProps) {
  const { t } = useTranslation();
  const [company, setCompany] = useState<FormCompany>(initData || emptyCompany);
  const [countryName, setCountryName] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { uploadCoLogo, uploadingLogo } = useUploadLogo();
  const [errors, setErrors] = useState<FormErrors>({});
  // Bumped after a successful submit to force LogoUpload to remount — it
  // owns its own preview URL internally, so resetting company.logo alone
  // wouldn't clear what's on screen.
  const [formKey, setFormKey] = useState(0);

  const countries = getLocalizedCountries(i18n.language);
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(countryName?.toLowerCase() || ""),
  );

  useEffect(() => {
    if (initData && initData.hqCountryCode) {
      const countryObj = countries.find(
        (c) => c.code === initData.hqCountryCode,
      );
      setCountryName(countryObj!.name);
    }
  }, []);

  useEffect(() => {
    if (serverErrors) setErrors((cur) => ({ ...cur, ...serverErrors }));
  }, [serverErrors]);

  function handleChange(name: keyof typeof company, value: string) {
    setCompany((cur) => ({ ...cur, [name]: value }));
    setErrors((cur) => ({ ...cur, [name]: undefined }));
  }

  function handleType(coType: typeof company.type | undefined) {
    if (!coType) return;
    handleChange("type", coType);
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!company.name.trim()) {
      next.name = t(
        "companies:errors.nameRequired",
        "Company name is required.",
      );
    }
    if (!company.hqCountryCode) {
      next.hqCountryCode = t(
        "companies:errors.countryRequired",
        "Country name is required.",
      );
    }
    if (!company.type) {
      next.type = t(
        "companies:errors.typeRequired",
        "Company type is required.",
      );
    }
    return next;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let imgId = company.logo;

    if (logoFile) {
      try {
        const url = await uploadCoLogo(logoFile);

        console.log("SUBMIT URL: ", url);

        imgId = url.slice(url.lastIndexOf("/") + 1);
      } catch (e) {
        console.error("ERROR: ", e);
        setErrors((cur) => ({
          ...cur,
          logo: t(
            "companies:errors.logoUploadFailed",
            "Couldn't upload the logo. Try again.",
          ),
        }));
        return;
      }
    }

    onSubmit({ ...company, logo: imgId ?? "" });

    setCompany(emptyCompany);
    setCountryName("");
    setLogoFile(null);
    setErrors({});
    setFormKey((k) => k + 1);
  }

  const busy = isSubmitting || uploadingLogo;

  return (
    <form className={styles.addCoFrom} onSubmit={handleSubmit}>
      <div className={styles.topRow}>
        <LogoUpload
          key={formKey}
          // label={t("companies:logoLabel", "Company logo")}
          value={company.logo ? `${BASE_IMG_URL}/${company.logo}` : null}
          onChange={(file) => {
            setLogoFile(file);
            setErrors((cur) => ({ ...cur, logo: undefined }));
          }}
          error={errors.logo}
          disabled={busy}
          size="lg"
        />

        <div className={styles.topRowFields}>
          <div className={styles.field}>
            <LabeledInput
              name="name"
              label={t("companies:companyNameLabel") + " *"}
              value={company.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleChange("name", e.target.value)
              }
            />
            <FieldError message={errors.name} className={styles.fieldError} />
          </div>

          <div className={styles.field}>
            <div
              style={{ position: "relative" }}
              onFocus={() => setIsOpen(true)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsOpen(false);
                }
              }}
            >
              <LabeledInput
                name="country-name"
                label={t("companies:countryNameLabel") + " *"}
                value={countryName || ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCountryName(e.target.value)
                }
              />
              <DisplayResult
                results={filtered}
                isOpen={isOpen}
                noResultsLabel={t("noResultsFound")}
                onSelect={(item) => {
                  setCountryName(item.name);
                  handleChange("hqCountryCode", item.code);
                  setIsOpen(false);
                }}
              />
            </div>
            <FieldError
              message={errors.hqCountryCode}
              className={styles.fieldError}
            />
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <TypeFilter
          coType={company.type}
          handleActive={handleType}
          nsFile="companies"
        />
        <FieldError message={errors.type} className={styles.fieldError} />
      </div>

      <FieldError message={errors.root} className={styles.formError} />

      <Button type="submit" style={{ alignSelf: "flex-end" }} disabled={busy}>
        {busy ? (
          <Spinner size="1rem" inline />
        ) : approve === undefined ? (
          isAdmin ? (
            t("companies:adminAddCoBtn")
          ) : (
            t("companies:addCoBtn")
          )
        ) : approve ? (
          t("companies:approveCoBtn")
        ) : (
          t("companies:editCoBtn")
        )}
      </Button>
    </form>
  );
}
