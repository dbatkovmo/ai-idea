'use client';

import {App, ConfigProvider, theme} from 'antd';
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
          colorBgElevated: '#1F1F1F',
          colorBgLayout: '#0D0D0D',
          colorBorder: 'rgba(255,255,255,0.08)',
          colorBorderSecondary: 'rgba(255,255,255,0.06)',
          colorPrimary: '#10A37F',
          colorSuccess: '#10A37F',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: '#3B82F6',
          colorText: '#FAFAFA',
          colorTextSecondary: '#A1A1AA',
          colorTextTertiary: '#71717A',
          borderRadius: 12,
          borderRadiusLG: 16,
          fontFamily:
            "Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14,
          controlHeight: 38,
          lineHeight: 1.5
        },
        components: {
          Layout: {
            bodyBg: '#0D0D0D',
            headerBg: 'rgba(13, 13, 13, 0.92)',
            headerHeight: 70,
            headerPadding: '0 28px',
            siderBg: '#111111',
            triggerBg: '#171717',
            triggerColor: '#A1A1AA'
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: '#1F1F1F',
            darkItemSelectedColor: '#FAFAFA',
            darkItemColor: '#A1A1AA',
            darkItemHoverBg: '#1A1A1A',
            darkItemHoverColor: '#FAFAFA',
            itemBorderRadius: 12,
            itemHeight: 46,
            itemMarginInline: 0,
            iconSize: 17
          },
          Card: {
            colorBgContainer: '#171717',
            colorBorderSecondary: 'rgba(255,255,255,0.06)',
            headerFontSize: 16,
            paddingLG: 20
          },
          Table: {
            headerBg: 'transparent',
            rowHoverBg: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.06)',
            cellPaddingBlock: 18,
            cellPaddingInline: 16,
            headerColor: '#A1A1AA',
            colorBgContainer: 'transparent'
          },
          Statistic: {
            titleFontSize: 11,
            contentFontSize: 30
          },
          Segmented: {
            itemSelectedBg: 'rgba(16, 163, 127, 0.14)',
            itemSelectedColor: '#10A37F',
            itemColor: '#71717A',
            itemHoverColor: '#A1A1AA',
            trackBg: 'transparent',
            trackPadding: 2
          },
          Button: {
            defaultBg: '#1F1F1F',
            defaultBorderColor: 'rgba(255,255,255,0.08)',
            defaultColor: '#FAFAFA'
          },
          Input: {
            colorBgContainer: '#1F1F1F',
            activeBorderColor: 'rgba(255,255,255,0.14)',
            hoverBorderColor: 'rgba(255,255,255,0.14)'
          },
          Select: {
            colorBgContainer: '#1F1F1F',
            optionSelectedBg: 'rgba(16, 163, 127, 0.14)'
          },
          DatePicker: {
            colorBgContainer: '#1F1F1F'
          },
          InputNumber: {
            colorBgContainer: '#1F1F1F'
          },
          Tag: {
            defaultBg: 'rgba(16, 163, 127, 0.1)',
            defaultColor: '#10A37F'
          },
          Alert: {
            colorWarningBg: 'rgba(245, 158, 11, 0.08)',
            colorWarningBorder: 'rgba(245, 158, 11, 0.18)'
          },
          List: {
            colorBorder: 'rgba(255,255,255,0.06)'
          },
          Descriptions: {
            colorSplit: 'rgba(255,255,255,0.06)'
          }
        }
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
