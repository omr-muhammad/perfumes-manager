import * as Select from "@radix-ui/react-select";
import { BsCheck, BsChevronDown } from "react-icons/bs";
import styles from "./styles/sex-filter.module.css";
import type { PerfumeSex } from "../api/perfumesAPI";
import { useTranslation } from "react-i18next";

const genders = [
  { value: "male", label: "male" },
  { value: "female", label: "female" },
  { value: "unisex", label: "unisex" },
];

type Sex = PerfumeSex | undefined;
interface SexFilterProps {
  sex: Sex;
  handleSelect: (value: Sex) => void;
  nsFile?: string;
}

export function SexFilter({ sex, handleSelect, nsFile }: SexFilterProps) {
  const { t } = useTranslation(nsFile);

  return (
    <Select.Root
      value={t(sex ?? "") ?? ""}
      onValueChange={(value) => handleSelect(value as Sex)}
    >
      <Select.Trigger className={styles.trigger}>
        <Select.Value placeholder={t("selectSex")} />

        <Select.Icon>
          <BsChevronDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={styles.content}
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport>
            {genders.map((item) => (
              <Select.Item
                key={item.value}
                value={item.value}
                className={styles.item}
              >
                <Select.ItemText>{t(item.label)}</Select.ItemText>

                <Select.ItemIndicator className={styles.indicator}>
                  <BsCheck size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
