'use client';

import {Flex} from 'antd';
import type {ReactNode} from 'react';

type PageContainerProps = {
  children: ReactNode;
  fill?: boolean;
};

export function PageContainer({children, fill}: PageContainerProps) {
  return (
    <Flex
      vertical
      gap={18}
      style={{
        width: '100%',
        maxWidth: 1320,
        margin: '0 auto',
        ...(fill ? {minHeight: '100%', flex: 1} : {})
      }}
    >
      {children}
    </Flex>
  );
}
