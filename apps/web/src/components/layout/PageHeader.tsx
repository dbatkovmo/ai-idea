'use client';

import {Flex, Typography, theme} from 'antd';
import type {ReactNode} from 'react';

const {Title, Text} = Typography;

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  extra?: ReactNode;
};

export function PageHeader({eyebrow, title, extra}: PageHeaderProps) {
  const {token} = theme.useToken();

  return (
    <Flex align="center" justify="space-between" gap={16} wrap="wrap" style={{minHeight: 64}}>
      <div style={{minWidth: 0}}>
        <Text
          style={{
            display: 'block',
            marginBottom: 6,
            color: token.colorPrimary,
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {eyebrow}
        </Text>
        <Title level={2} style={{margin: 0, fontWeight: 700}}>
          {title}
        </Title>
      </div>
      {extra ? <div style={{flexShrink: 0}}>{extra}</div> : null}
    </Flex>
  );
}
