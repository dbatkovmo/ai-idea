'use client';

import {ConfigProvider, theme} from 'antd';
import ruRU from 'antd/locale/ru_RU';
import type {ReactNode} from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({children}: AppProvidersProps) {
  return (
    <ConfigProvider
      locale={ruRU}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#0D0D0D',
          colorBgContainer: '#171717',
          colorBorder: 'rgba(255,255,255,0.10)',
          colorPrimary: '#10A37F',
          colorSuccess: '#10A37F',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorText: '#FAFAFA',
          colorTextSecondary: '#A1A1AA',
          borderRadius: 12,
          fontFamily:
            "Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        },
        components: {
          Layout: {
            bodyBg: '#0D0D0D',
            headerBg: '#0D0D0D',
            headerHeight: 70,
            headerPadding: '0 28px',
            siderBg: '#111111',
            triggerBg: '#171717',
            triggerColor: '#A1A1AA'
          },
          Menu: {
            darkItemBg: '#111111',
            darkSubMenuItemBg: '#111111',
            darkItemSelectedBg: '#1F1F1F',
            darkItemSelectedColor: '#FAFAFA',
            darkItemColor: '#A1A1AA',
            darkItemHoverBg: '#1A1A1A',
            darkItemHoverColor: '#FAFAFA',
            itemBg: '#111111',
            itemSelectedBg: '#1F1F1F',
            itemSelectedColor: '#FAFAFA',
            itemColor: '#A1A1AA',
            itemHoverBg: '#1A1A1A',
            itemHoverColor: '#FAFAFA'
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
