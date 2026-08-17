import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import styles from "./companies.module.css";
import type { NewCompany, Company } from "../../api/companiesAPI";
import { LabeledInput } from "../../ui/LabeledInput";
import { useTranslation } from "react-i18next";
import { TypeFilter } from "../../ui/TypeFilter";
import DisplayResult from "../../ui/DisplayResult";
import i18n from "../../i18";
import { getLocalizedCountries } from "../../utils/countries";
import toast from "react-hot-toast";
import Button from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";

type FormCompany = Omit<Company, "createdAt" | "updatedAt" | "id" | "approved">;

type CoFormProps = {
  initData?: FormCompany;
  approve?: boolean;
  onSubmit: (newCo: NewCompany) => void;
  isSubmitting: boolean;
  isAdmin: boolean;
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
}: CoFormProps) {
  const { t } = useTranslation();
  const [company, setCompany] = useState<FormCompany>(initData || emptyCompany);
  const [countryName, setCountryName] = useState<string>();
  const [isOpen, setIsOpen] = useState(false);

  const countries = getLocalizedCountries(i18n.language);
  const filtered = countries.filter((c) => c.name.includes(countryName!));

  useEffect(() => {
    if (initData && initData.hqCountryCode) {
      const countryObj = countries.find(
        (c) => c.code === initData.hqCountryCode,
      );
      setCountryName(countryObj!.name);
    }
  }, []);

  function handleChange(name: keyof typeof company, value: string) {
    setCompany((cur) => ({ ...cur, [name]: value }));
  }

  function handleType(coType: typeof company.type | undefined) {
    if (!coType) return;

    handleChange("type", coType);
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (!company.hqCountryCode) return toast.error("Country name is required.");
    if (!company.name) return toast.error("Company name is required.");
    if (!company.type) return toast.error("Comany type is required.");

    onSubmit(company as NewCompany);

    setCompany(emptyCompany);
    setCountryName("");
  }

  return (
    <form className={styles.addCoFrom} onSubmit={handleSubmit}>
      <LabeledInput
        name="name"
        label={t("companies:companyNameLabel") + " *"}
        value={company.name}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange("name", e.target.value)
        }
        // required
      />

      <div
        style={{ position: "relative" }}
        onFocus={() => setIsOpen(true)}
        onBlur={(e) => {
          // don't close if focus moved somewhere still inside this wrapper
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
          // required
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

      {/* <LabeledInput
        name="logo"
        label={t("companies:logoInputLabel")}
        value={company.logo || ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleChange("logo", e.target.value)
        }
      /> */}

      <TypeFilter
        coType={company.type}
        handleActive={handleType}
        nsFile="companies"
      />

      <Button
        type="submit"
        style={{ alignSelf: "flex-end" }}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Spinner size="1rem" inline />
        ) : approve === undefined ? ( // we're adding new company
          isAdmin ? ( // admin add approved company directly
            t("companies:adminAddCoBtn")
          ) : (
            t("companies:addCoBtn")
          )
        ) : approve ? ( // true => approve mode else edit
          t("companies:approveCoBtn")
        ) : (
          t("companies:editCoBtn")
        )}
      </Button>
    </form>
  );
}
