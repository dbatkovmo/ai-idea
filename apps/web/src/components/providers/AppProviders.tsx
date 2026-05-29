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
          colorBgBase: '#05070a',
          colorBgContainer: '#0c1016',
          colorBorder: '#252b35',
          colorPrimary: '#61d7ff',
          colorSuccess: '#35d399',
          colorWarning: '#f1bc5b',
          colorError: '#ff6f6f',
          colorText: '#f2f6fb',
          colorTextSecondary: '#9aa6b5',
          borderRadius: 8,
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
