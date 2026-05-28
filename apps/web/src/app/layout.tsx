import type {Metadata} from 'next';
import {AntdRegistry} from '@ant-design/nextjs-registry';
import type {ReactNode} from 'react';
import 'antd/dist/reset.css';
import './globals.scss';
import {AppProviders} from '@/components/providers/AppProviders';

export const metadata: Metadata = {
  title: 'AI Football Value',
  description: 'Football quant analytics dashboard for pre-match 1X2 value bets'
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({children}: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AppProviders>{children}</AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
