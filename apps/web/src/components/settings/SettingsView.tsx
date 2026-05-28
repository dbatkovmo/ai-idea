'use client';

import {Switch} from 'antd';
import {useLocale} from 'next-intl';

const settings = [
  [{en: 'API-Football collector', ru: 'Сборщик API-Football'}, false],
  [{en: 'Fonbet odds collector', ru: 'Сборщик odds Fonbet'}, false],
  [{en: 'Winline odds collector', ru: 'Сборщик odds Winline'}, false],
  [{en: '15 minute scheduler', ru: 'Обновление каждые 15 минут'}, false],
  [{en: 'CLV tracking', ru: 'Отслеживание CLV'}, true],
  [{en: 'Leakage guardrails', ru: 'Защита от leakage'}, true]
] as const;

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
    badge: 'MVP конфиг',
    modules: 'Модули платформы'
  }
};

export function SettingsView() {
  const locale = useLocale();
  const activeLocale = locale === 'en' ? 'en' : 'ru';

  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">{copy[activeLocale].eyebrow}</p>
          <h2 className="page-header__title">{copy[activeLocale].title}</h2>
        </div>
        <span className="data-pill">{copy[activeLocale].badge}</span>
      </section>

      <section className="panel">
        <div className="panel__header">
          <h3 className="panel__title">{copy[activeLocale].modules}</h3>
        </div>
        <div className="metric-list">
          {settings.map(([label, enabled]) => (
            <div className="metric-list__row" key={label.en}>
              <span>{label[activeLocale]}</span>
              <Switch checked={enabled} disabled />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
