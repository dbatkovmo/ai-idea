'use client';

import {ApiOutlined, DatabaseOutlined} from '@ant-design/icons';
import {Alert, Button, Skeleton, Tag} from 'antd';
import {useLocale} from 'next-intl';

type DataStatusProps = {
  isLoading: boolean;
  error: string | null;
  source: 'api' | 'mock';
};

export function DataStatus({isLoading, error, source}: DataStatusProps) {
  const locale = useLocale();
  const isRu = locale !== 'en';

  if (isLoading) {
    return <Skeleton active paragraph={{rows: 1}} title={false} style={{width: 140}} />;
  }

  if (error) {
    return (
      <Alert
        showIcon
        type="warning"
        message={isRu ? 'Локальные данные' : 'Local data'}
        description={
          isRu
            ? 'FastAPI пока не отвечает, поэтому интерфейс использует стартовые MVP-данные.'
            : 'FastAPI is not available yet, so the dashboard keeps working with seeded MVP data.'
        }
        action={<Button size="small">{isRu ? 'Подробнее' : 'Details'}</Button>}
      />
    );
  }

  const isLive = source === 'api';

  return (
    <Tag icon={isLive ? <ApiOutlined /> : <DatabaseOutlined />} color={isLive ? 'success' : 'default'}>
      {isLive ? (isRu ? 'Живой API' : 'Live API') : isRu ? 'Демо-данные' : 'Mock data'}
    </Tag>
  );
}
