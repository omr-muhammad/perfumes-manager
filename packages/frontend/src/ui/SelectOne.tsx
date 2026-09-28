import i18n from "../i18";
import * as Select from "@radix-ui/react-select";

import { BsCheck, BsChevronDown } from "react-icons/bs";

import styles from "./SelectOne.module.css";

interface Option {
  value: string;
  label: string;
}

interface SelectOneProps {
  value: string;
  handleSelect: (value: string) => void;
  placeholder: string;
  options: Option[];
}

export function SelectOne({
  value,
  handleSelect,
  placeholder,
  options,
}: SelectOneProps) {
  return (
    <Select.Root value={value} onValueChange={(value) => handleSelect(value)}>
      <Select.Trigger className={styles.trigger}>
        <Select.Value placeholder={placeholder}>{value}</Select.Value>

        <Select.Icon>
          <BsChevronDown />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className={styles.content}
          dir={i18n.language === "ar" ? "rtl" : "ltr"}
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport>
            {options.map((item) => (
              <Select.Item
                key={item.value}
                value={item.value}
                className={styles.item}
              >
                <Select.ItemText>{item.label}</Select.ItemText>

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
