'use client';

import {Card, Flex, List, Switch, Tag, Typography} from 'antd';
import {useLocale} from 'next-intl';

type LocaleKey = 'en' | 'ru';
type SettingItem = {
  label: Record<LocaleKey, string>;
  enabled: boolean;
};

const settings: SettingItem[] = [
  {label: {en: 'football-data.org collector', ru: '\u0421\u0431\u043e\u0440\u0449\u0438\u043a football-data.org'}, enabled: true},
  {label: {en: 'Fonbet odds collector', ru: '\u0421\u0431\u043e\u0440\u0449\u0438\u043a \u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442\u043e\u0432 Fonbet'}, enabled: false},
  {label: {en: 'Winline odds collector', ru: '\u0421\u0431\u043e\u0440\u0449\u0438\u043a \u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442\u043e\u0432 Winline'}, enabled: false},
  {label: {en: '15 minute scheduler', ru: '\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0435 \u043a\u0430\u0436\u0434\u044b\u0435 15 \u043c\u0438\u043d\u0443\u0442'}, enabled: false},
  {label: {en: 'CLV tracking', ru: '\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 CLV'}, enabled: true},
  {label: {en: 'Leakage guardrails', ru: '\u0417\u0430\u0449\u0438\u0442\u0430 \u043e\u0442 leakage'}, enabled: true}
];

const copy = {
  en: {
    eyebrow: 'Environment',
    title: 'Settings',
    badge: 'MVP config',
    modules: 'Platform Modules'
  },
  ru: {
    eyebrow: '\u041e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u0435',
    title: '\u041d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438',
    badge: 'MVP-\u043a\u043e\u043d\u0444\u0438\u0433',
    modules: '\u041c\u043e\u0434\u0443\u043b\u0438 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b'
  }
};

export function SettingsView() {
  const locale = useLocale();
  const activeLocale: LocaleKey = locale === 'en' ? 'en' : 'ru';

  return (
    <main className="dashboard">
      <Flex className="page-header" align="center" justify="space-between" gap={18}>
        <div>
          <Typography.Text className="page-header__eyebrow">{copy[activeLocale].eyebrow}</Typography.Text>
          <Typography.Title level={2} className="page-header__title">{copy[activeLocale].title}</Typography.Title>
        </div>
        <Tag className="tag-soft">{copy[activeLocale].badge}</Tag>
      </Flex>

      <Card className="analytics-card" title={copy[activeLocale].modules} variant="borderless">
        <List
          dataSource={settings}
          renderItem={({label, enabled}) => (
            <List.Item actions={[<Switch checked={enabled} disabled key={label.en} />]}>
              <Typography.Text>{label[activeLocale]}</Typography.Text>
            </List.Item>
          )}
        />
      </Card>
    </main>
  );
}
