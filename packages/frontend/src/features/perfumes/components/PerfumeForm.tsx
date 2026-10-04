import { useState, type ChangeEvent, type SubmitEvent } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { LabeledInput } from "@/ui/LabeledInput";
import { SelectOne } from "@/ui/SelectOne";
import { SeasonsFilter } from "@/ui/SeasonsFilter";
import LabeledTextarea from "@/ui/LabeledTextarea";
import { Spinner } from "@/ui/Spinner";

import type { FormPerfume, PerfumeSex, Season } from "../types";

import styles from "./PerfumeForm.module.css";

// import { FieldError } from "../../ui/FieldError";
interface FormProps {
  initialData?: FormPerfume;
  perfumeId?: number;
  approve?: boolean;
  onSubmit: (perfume: FormPerfume) => void;
  isSubmitting: boolean;
  isAdmin: boolean;
}

// interface FormErrors {
//   name?: string;
//   sex?: string;
//   seasons?: string;
//   descriptionEn?: string;
//   descriptionAr?: string;
// }

const EmptyPerfume: FormPerfume = {
  name: "",
  sex: null,
  seasons: [],
  descriptionEn: "",
  descriptionAr: "",
};

export function PerfumeForm({
  initialData,
  approve,
  onSubmit,
  isSubmitting,
  isAdmin,
}: FormProps) {
  const { t } = useTranslation();
  const [perfume, setPerfume] = useState<FormPerfume>(
    initialData || EmptyPerfume,
  );
  // const [errors] = useState<FormErrors>({});

  function handleSeasons(season: Season) {
    setPerfume((cur) => ({
      ...cur,
      seasons: cur.seasons!.includes(season)
        ? cur.seasons!.filter((s) => s !== season)
        : cur.seasons!.concat(season),
    }));
  }

  function handleChange(name: keyof typeof perfume, value: string) {
    if (name === "seasons") return handleSeasons(value as Season);

    setPerfume((cur) => ({ ...cur, [name]: value }));
  }

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const { name, seasons, sex, descriptionAr, descriptionEn } = perfume;

    if (
      !name ||
      seasons!.length <= 0 ||
      !sex ||
      !descriptionAr ||
      !descriptionEn
    )
      return toast.error("perfumes:errors.missingReq");

    onSubmit(perfume);
  }

  return (
    <form className={styles.apForm} onSubmit={handleSubmit}>
      <div className={`${styles.formContent} hide-scrollbar`}>
        <div className={styles.apRow}>
          <LabeledInput
            name="name"
            label={t("perfumes:name")}
            value={perfume.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange("name", e.target.value)
            }
            required
          />
          {/* <FieldError message={errors.name} /> */}
        </div>

        <div className={styles.apRowTwoCol}>
          <div>
            <SelectOne
              options={[
                { value: "male", label: t("filters.male") },
                { value: "female", label: t("filters.female") },
                { value: "unisex", label: t("filters.unisex") },
              ]}
              placeholder={t("filters.selectSex")}
              value={perfume.sex ?? ""}
              handleSelect={(val) => handleChange("sex", val as PerfumeSex)}
            />
            {/* <FieldError message={errors.sex} /> */}
          </div>

          <div>
            <SeasonsFilter
              selected={perfume.seasons!}
              handleSelect={handleSeasons}
            />
            {/* <FieldError message={errors.seasons} /> */}
          </div>
        </div>

        <div className={styles.apRowTwoCol}>
          <div>
            <LabeledTextarea
              name="descriptionEn"
              label={t("perfumes:engDescription")}
              value={perfume.descriptionEn!}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("descriptionEn", e.target.value)
              }
              dir="ltr"
              lang="en"
              required
            />
            {/* <FieldError message={errors.descriptionEn} /> */}
          </div>

          <div>
            <LabeledTextarea
              name="descriptionAr"
              label={t("perfumes:arDescription")}
              value={perfume.descriptionAr!}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange("descriptionAr", e.target.value)
              }
              dir="rtl"
              lang="ar"
              required
            />
            {/* <FieldError message={errors.descriptionAr} /> */}
          </div>
        </div>
      </div>
      <div className={styles.apActions}>
        <button
          type="submit"
          className={styles.apButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner size="1rem" inline />
          ) : approve === undefined ? ( // we're adding new perfume
            isAdmin ? ( // admin add approved perfume directly
              t("perfumes:adminAddBtn")
            ) : (
              t("perfumes:addBtn")
            )
          ) : approve ? ( // true => approve mode else edit
            t("perfumes:approveBtn")
          ) : (
            t("perfumes:editBtn")
          )}
        </button>
      </div>
    </form>
  );
}
