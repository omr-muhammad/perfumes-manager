import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";
import styles from "./styles/seasons-filter.module.css";
import { HiCheck } from "react-icons/hi";
import type { Season } from "../api/perfumesAPI";
import { useTranslation } from "react-i18next";

const options = [
  { value: "spring", label: "spring" },
  { value: "summer", label: "summer" },
  { value: "fall", label: "fall" },
  { value: "winter", label: "winter" },
] as const;

interface SeasonsFilterProps {
  selected: Season[] | undefined;
  handleSelect: (value: Season) => void;
  nsFile?: string;
}

export function SeasonsFilter({
  selected = [],
  handleSelect,
  nsFile,
}: SeasonsFilterProps) {
  const { t } = useTranslation(nsFile);

  const triggerText =
    selected.length > 0
      ? t("selectedSeasons", { count: selected.length })
      : t("selectSeason");

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={styles.trigger}>{triggerText}</button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          sideOffset={6}
          align="start"
        >
          {options.map((option) => (
            <label key={option.value} className={styles.option}>
              <Checkbox.Root
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleSelect(option.value)}
                className={styles.checkbox}
              >
                <Checkbox.Indicator className={styles.indicator}>
                  <HiCheck size={14} />
                </Checkbox.Indicator>
              </Checkbox.Root>

              <span>{t(option.label)}</span>
            </label>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
