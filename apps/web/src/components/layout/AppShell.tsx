'use client';

import {
  BarChartOutlined,
  CalendarOutlined,
  DashboardOutlined,
  LineChartOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {Avatar, Flex, Layout, Menu, Typography, theme} from 'antd';
import Link from 'next/link';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
import type {ReactNode} from 'react';
import {useState} from 'react';
import {TopbarActions} from './TopbarActions';

const {Sider, Header, Content} = Layout;
const {Text, Title} = Typography;

const navItems = [
  {key: '', icon: <DashboardOutlined />, label: {en: 'Dashboard', ru: 'Дашборд'}},
  {key: 'matches', icon: <CalendarOutlined />, label: {en: 'Matches', ru: 'Матчи'}},
  {key: 'value-bets', icon: <ThunderboltOutlined />, label: {en: 'Value Bets', ru: 'Value Bets'}},
  {key: 'model-stats', icon: <BarChartOutlined />, label: {en: 'Model Stats', ru: 'Модель'}},
  {key: 'backtesting', icon: <LineChartOutlined />, label: {en: 'Backtesting', ru: 'Бэктест'}},
  {key: 'settings', icon: <SettingOutlined />, label: {en: 'Settings', ru: 'Настройки'}}
];

const shellCopy = {
  en: {
    title: 'Pre-Match 1X2 Value Monitor',
    subtitle: 'Top five leagues · EV, CLV, odds movement, calibration',
    validation: 'Model validation status',
    workspace: 'EV Lab',
    workspaceMeta: 'AI analytics workspace'
  },
  ru: {
    title: 'Мониторинг 1X2 Value Bets',
    subtitle: 'Топ-5 лиг · EV, CLV, движение odds, калибровка',
    validation: 'Статус валидации модели',
    workspace: 'EV Lab',
    workspaceMeta: 'Рабочая среда AI-аналитики'
  }
};

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({children}: AppShellProps) {
  const {token} = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
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

  const handleLocaleChange = (nextLocale: 'ru' | 'en') => {
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/') || `/${nextLocale}`);
  };

  return (
    <Layout style={{minHeight: '100vh', height: '100vh', overflow: 'hidden'}}>
      <Sider
        width={240}
        breakpoint="lg"
        collapsedWidth={76}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{borderRight: `1px solid ${token.colorBorderSecondary}`}}
      >
        <Flex vertical style={{height: '100%', padding: collapsed ? '20px 12px' : '20px 16px'}}>
          <Flex
            align="center"
            justify={collapsed ? 'center' : 'flex-start'}
            gap={12}
            style={{marginBottom: 16, minHeight: 48}}
          >
            <Avatar
              shape="square"
              size={34}
              icon={<LineChartOutlined />}
              style={{
                background: 'rgba(16, 163, 127, 0.14)',
                color: token.colorPrimary,
                border: `1px solid rgba(16, 163, 127, 0.32)`,
                borderRadius: 10,
                flexShrink: 0
              }}
            />
            {!collapsed ? (
              <Text strong style={{color: token.colorText, whiteSpace: 'nowrap'}}>
                Football Value AI
              </Text>
            ) : null}
          </Flex>

          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{flex: 1, borderInlineEnd: 0, background: 'transparent', padding: '8px 0'}}
          />

          {!collapsed ? (
            <Flex
              vertical
              gap={4}
              style={{
                marginTop: 16,
                padding: 14,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 14,
                background: token.colorBgContainer
              }}
            >
              <Text strong style={{fontSize: 13}}>
                {shellCopy[activeLocale].workspace}
              </Text>
              <Text type="secondary" style={{fontSize: 12}}>
                {shellCopy[activeLocale].workspaceMeta}
              </Text>
            </Flex>
          ) : null}
        </Flex>
      </Sider>

      <Layout style={{minWidth: 0, overflow: 'hidden'}}>
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            backdropFilter: 'blur(16px)',
            lineHeight: 'normal',
            padding: '0 28px'
          }}
        >
          <div style={{minWidth: 0}}>
            <Title level={4} style={{margin: 0, fontWeight: 700, lineHeight: 1.2}} ellipsis>
              {shellCopy[activeLocale].title}
            </Title>
            <Text type="secondary" style={{fontSize: 13, display: 'block', marginTop: 4}} ellipsis>
              {shellCopy[activeLocale].subtitle}
            </Text>
          </div>

          <TopbarActions
            activeLocale={activeLocale}
            validationLabel={shellCopy[activeLocale].validation}
            onLocaleChange={handleLocaleChange}
          />
        </Header>

        <Content
          style={{
            height: 'calc(100vh - 70px)',
            padding: '28px 32px 34px',
            overflow: 'auto'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
