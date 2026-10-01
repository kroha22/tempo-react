"use client";

import { Radio, RadioGroup } from "react-aria-components";
import styles from "./choice-group.module.css";

type ChoiceGroupProps = {
  label: string;
  name?: string;
  value: string | null;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string; disabled?: boolean }>;
  disabled?: boolean;
  optionLang?: string;
};

export function ChoiceGroup({ label, name, value, onChange, options, disabled, optionLang }: ChoiceGroupProps) {
  return <RadioGroup aria-label={label} name={name} value={value} onChange={onChange} isDisabled={disabled} className={styles.group}>
    {options.map((option) => <Radio key={option.value} value={option.value} isDisabled={option.disabled} className={styles.choice}>
      <span className={styles.indicator} aria-hidden="true" />
      <span lang={optionLang}>{option.label}</span>
    </Radio>)}
  </RadioGroup>;
}
