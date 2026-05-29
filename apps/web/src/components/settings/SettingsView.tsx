'use client';

import {Card, List, Switch, Tag} from 'antd';
import {useLocale} from 'next-intl';
import {PageContainer} from '@/components/layout/PageContainer';
import {PageHeader} from '@/components/layout/PageHeader';

type LocaleKey = 'en' | 'ru';
type SettingItem = {
  label: Record<LocaleKey, string>;
  enabled: boolean;
};

const settings: SettingItem[] = [
  {label: {en: 'football-data.org collector', ru: 'Сборщик football-data.org'}, enabled: true},
  {label: {en: 'Fonbet odds collector', ru: 'Сборщик коэффициентов Fonbet'}, enabled: false},
  {label: {en: 'Winline odds collector', ru: 'Сборщик коэффициентов Winline'}, enabled: false},
  {label: {en: '15 minute scheduler', ru: 'Обновление каждые 15 минут'}, enabled: false},
  {label: {en: 'CLV tracking', ru: 'Отслеживание CLV'}, enabled: true},
  {label: {en: 'Leakage guardrails', ru: 'Защита от leakage'}, enabled: true}
];

const copy = {
  en: {
    eyebrow: 'Environment',
    title: 'Settings',
    badge: 'MVP config',
    modules: 'Platform Modules'
  },
  ru: {
    eyebrow: 'Окружение',
    title: 'Настройки',
    badge: 'MVP-конфиг',
    modules: 'Модули платформы'
  }
};

export function SettingsView() {
  const locale = useLocale();
  const activeLocale: LocaleKey = locale === 'en' ? 'en' : 'ru';

  return (
    <PageContainer>
      <PageHeader
        eyebrow={copy[activeLocale].eyebrow}
        title={copy[activeLocale].title}
        extra={<Tag>{copy[activeLocale].badge}</Tag>}
      />

      <Card bordered={false} title={copy[activeLocale].modules} styles={{body: {padding: 20}}}>
        <List
          dataSource={settings}
          renderItem={({label, enabled}) => (
            <List.Item actions={[<Switch checked={enabled} disabled key={label.en} />]}>
              {label[activeLocale]}
            </List.Item>
          )}
        />
      </Card>
    </PageContainer>
  );
}
