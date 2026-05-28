'use client';

import {Alert, Skeleton} from 'antd';
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
    return <Skeleton active paragraph={{rows: 1}} title={false} />;
  }

  if (error) {
    return (
      <Alert
        showIcon
        type="warning"
        message={isRu ? 'Локальные данные' : 'Using local fallback data'}
        description={
          isRu
            ? 'FastAPI пока не отвечает, поэтому интерфейс использует стартовые MVP-данные.'
            : 'FastAPI is not available yet, so the dashboard keeps working with seeded MVP data.'
        }
      />
    );
  }

  return (
    <span className="data-pill">
      {source === 'api' ? (isRu ? 'Live API' : 'Live API') : isRu ? 'Mock-данные' : 'Mock data'}
    </span>
  );
}
