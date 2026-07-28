import { useState, type ChangeEvent, type SubmitEvent } from "react";
import type { Perfume, PerfumeSex, Season } from "../../api/perfumesAPI";
import styles from "./perfume-form.module.css";
import { LabeledInput } from "../../ui/LabeledInput";
import { useTranslation } from "react-i18next";
import { SexFilter } from "../../ui/SexFilter";
import { SeasonsFilter } from "../../ui/SeasonsFilter";
import LabeledTextarea from "../../ui/LabeledTextarea";
import { Spinner } from "../../ui/Spinner";
import toast from "react-hot-toast";
// import { FieldError } from "../../ui/FieldError";

export type FormPerfume = Omit<
  Perfume,
  "createdAt" | "updatedAt" | "approved" | "id"
>;

interface FormProps {
  initialData?: FormPerfume;
  perfumeId?: string;
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

interface EmptyPerfume {
  name: string;
  sex: PerfumeSex | null;
  seasons: Season[];
  descriptionEn: string;
  descriptionAr: string;
}

const EmptyPerfume: EmptyPerfume = {
  name: "",
  sex: null,
  seasons: [],
  descriptionEn: "",
  descriptionAr: "",
};

export function PerfumeForm({
  initialData,
  // perfumeId,
  onSubmit,
  isSubmitting,
  isAdmin,
}: FormProps) {
  const { t } = useTranslation("perfumes");
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
    // console.log("Name: ", name);
    // console.log("Value: ", value);
    if (name === "seasons") return handleSeasons(value as Season);

    setPerfume((cur) => ({ ...cur, [name]: value }));

    console.log(perfume[name]);
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const { name, seasons, sex, descriptionAr, descriptionEn } = perfume;

    console.log("Perfuem: ", perfume);

    if (
      !name ||
      seasons!.length <= 0 ||
      !sex ||
      !descriptionAr ||
      !descriptionEn
    )
      return toast.error("Missing required data!");

    onSubmit(perfume);
  }

  return (
    <form className={styles.apForm} onSubmit={handleSubmit}>
      {/* <h2>{t("addTab.heading")}</h2> */}

      <div className={`${styles.formContent} hide-scrollbar`}>
        <div className={styles.apRow}>
          <LabeledInput
            name="name"
            label={t("addTab.name")}
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
            <SexFilter
              sex={perfume.sex || ""}
              handleSelect={(val) => handleChange("sex", val)}
              nsFile="perfumes"
            />
            {/* <FieldError message={errors.sex} /> */}
          </div>

          <div>
            <SeasonsFilter
              selected={perfume.seasons!}
              handleSelect={handleSeasons}
              nsFile="perfumes"
            />
            {/* <FieldError message={errors.seasons} /> */}
          </div>
        </div>

        <div className={styles.apRowTwoCol}>
          <div>
            <LabeledTextarea
              name="descriptionEn"
              label={t("addTab.engDescription")}
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
              label={t("addTab.arDescription")}
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
          ) : isAdmin ? (
            t("addTab.adminAddBtn")
          ) : (
            t("addTab.addBtn")
          )}
        </button>
      </div>
    </form>
  );
}
