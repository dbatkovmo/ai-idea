'use client';

import {Card} from 'antd';
import type {ReactNode} from 'react';

type FilterCardProps = {
  children: ReactNode;
};

export function FilterCard({children}: FilterCardProps) {
  return (
    <Card bordered={false} styles={{body: {padding: '16px 20px'}}}>
      {children}
    </Card>
  );
}
