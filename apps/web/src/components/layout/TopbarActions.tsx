'use client';

import {SafetyCertificateOutlined} from '@ant-design/icons';
import {Button, Flex, Tooltip} from 'antd';
import {LanguageSwitch} from './LanguageSwitch';

type LocaleCode = 'ru' | 'en';

type TopbarActionsProps = {
  activeLocale: LocaleCode;
  validationLabel: string;
  onLocaleChange: (locale: LocaleCode) => void;
};

export function TopbarActions({activeLocale, validationLabel, onLocaleChange}: TopbarActionsProps) {
  return (
    <Flex align="center" gap={10} className="topbar-actions">
      <LanguageSwitch value={activeLocale} onChange={onLocaleChange} />

      <Tooltip title={validationLabel} placement="bottomRight" mouseEnterDelay={0.35}>
        <Button
          type="text"
          className="topbar-actions__status"
          aria-label={validationLabel}
          icon={<SafetyCertificateOutlined />}
        />
      </Tooltip>
    </Flex>
  );
}
