'use client';

import {Button, Layout, Menu, Segmented, Space, Tooltip} from 'antd';
import {Activity, BarChart3, Brain, CalendarDays, Gauge, LineChart, Settings, ShieldCheck} from 'lucide-react';
import Link from 'next/link';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import type {ReactNode} from 'react';

const {Sider, Header, Content} = Layout;

const navItems = [
  {key: '', icon: <Gauge size={17} />, label: {en: 'Dashboard', ru: 'Дашборд'}},
  {key: 'matches', icon: <CalendarDays size={17} />, label: {en: 'Matches', ru: 'Матчи'}},
  {key: 'value-bets', icon: <Activity size={17} />, label: {en: 'Value Bets', ru: 'Value Bets'}},
  {key: 'model-stats', icon: <Brain size={17} />, label: {en: 'Model Stats', ru: 'Модель'}},
  {key: 'backtesting', icon: <BarChart3 size={17} />, label: {en: 'Backtesting', ru: 'Бэктест'}},
  {key: 'settings', icon: <Settings size={17} />, label: {en: 'Settings', ru: 'Настройки'}}
];

const shellCopy = {
  en: {
    title: 'Pre-Match 1X2 Value Monitor',
    subtitle: 'Top five leagues · EV, CLV, odds movement, calibration',
    validation: 'Model validation status'
  },
  ru: {
    title: 'Мониторинг 1X2 Value Bets',
    subtitle: 'Топ-5 лиг · EV, CLV, движение коэффициентов, калибровка',
    validation: 'Статус валидации модели'
  }
};

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({children}: AppShellProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const activeLocale = locale === 'en' ? 'en' : 'ru';
  const basePath = `/${locale}`;
  const selectedKey =
    navItems
      .map((item) => `${basePath}${item.key ? `/${item.key}` : ''}`)
      .find((href) => pathname === href || (href !== basePath && pathname.startsWith(href))) ?? basePath;

  const menuItems = navItems.map((item) => {
    const href = `${basePath}${item.key ? `/${item.key}` : ''}`;
    return {
      key: href,
      icon: item.icon,
      label: <Link href={href}>{item.label[activeLocale]}</Link>
    };
  });

  const handleLocaleChange = (nextLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/') || `/${nextLocale}`);
  };

  return (
    <Layout className="app-shell">
      <Sider className="app-shell__sidebar" width={240} breakpoint="lg" collapsedWidth={76}>
        <div className="app-shell__brand">
          <span className="app-shell__brand-mark">
            <LineChart size={18} />
          </span>
          <span className="app-shell__brand-name">Football Value AI</span>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
        <div className="app-shell__sidebar-footer">
          <span className="app-shell__status-dot" />
          <span className="app-shell__sidebar-footer-text">EV LAB · 1X2</span>
        </div>
      </Sider>

      <Layout>
        <Header className="app-shell__topbar">
          <div className="app-shell__topbar-copy">
            <h1 className="app-shell__title">{shellCopy[activeLocale].title}</h1>
            <p className="app-shell__subtitle">{shellCopy[activeLocale].subtitle}</p>
          </div>
          <Space className="app-shell__topbar-actions" size={10}>
            <Segmented
              aria-label="Language"
              size="small"
              value={activeLocale}
              options={[
                {label: 'RU', value: 'ru'},
                {label: 'EN', value: 'en'}
              ]}
              onChange={(value) => handleLocaleChange(String(value))}
            />
            <Tooltip title={shellCopy[activeLocale].validation}>
              <Button aria-label={shellCopy[activeLocale].validation} icon={<ShieldCheck size={17} />} />
            </Tooltip>
          </Space>
        </Header>
        <Content className="app-shell__content">{children}</Content>
      </Layout>
    </Layout>
  );
}
