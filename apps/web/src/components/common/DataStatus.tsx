'use client';

import {Alert, Button, Skeleton} from 'antd';
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
        message={isRu ? '\u041b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435' : 'Local data'}
        description={
          isRu
            ? 'FastAPI \u043f\u043e\u043a\u0430 \u043d\u0435 \u043e\u0442\u0432\u0435\u0447\u0430\u0435\u0442, \u043f\u043e\u044d\u0442\u043e\u043c\u0443 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442 \u0441\u0442\u0430\u0440\u0442\u043e\u0432\u044b\u0435 MVP-\u0434\u0430\u043d\u043d\u044b\u0435.'
            : 'FastAPI is not available yet, so the dashboard keeps working with seeded MVP data.'
        }
        action={<Button size="small">{isRu ? '\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435' : 'Details'}</Button>}
      />
    );
  }

  return (
    <span className="data-pill">
      {source === 'api' ? (isRu ? '\u0416\u0438\u0432\u043e\u0439 API' : 'Live API') : isRu ? '\u0414\u0435\u043c\u043e-\u0434\u0430\u043d\u043d\u044b\u0435' : 'Mock data'}
    </span>
  );
}
