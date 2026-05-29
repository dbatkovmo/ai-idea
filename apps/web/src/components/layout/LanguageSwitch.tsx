'use client';

import {Segmented} from 'antd';

type LocaleCode = 'ru' | 'en';

type LanguageSwitchProps = {
  value: LocaleCode;
  onChange: (value: LocaleCode) => void;
};

export function LanguageSwitch({value, onChange}: LanguageSwitchProps) {
  return (
    <Segmented
      aria-label="Language"
      className="language-switch"
      size="small"
      value={value}
      options={[
        {label: 'RU', value: 'ru'},
        {label: 'EN', value: 'en'}
      ]}
      onChange={(next) => onChange(next as LocaleCode)}
    />
  );
}
