'use client';

import {Card, Descriptions, Flex, Progress, Space, Typography} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {StatCard} from '@/components/dashboard/StatCard';
import {fallbackData, getModelStats} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';

export function ModelStatsView() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const loadModelStats = useCallback(() => getModelStats(), []);
  const modelStatsState = useApiResource(loadModelStats, fallbackData.modelStats);
  const stats = modelStatsState.data;

  return (
    <main className="dashboard">
      <Flex className="page-header" align="center" justify="space-between" gap={18}>
        <div>
          <Typography.Text className="page-header__eyebrow">{stats.modelVersion}</Typography.Text>
          <Typography.Title level={2} className="page-header__title">
            {isRu ? '\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043a\u0430 \u043c\u043e\u0434\u0435\u043b\u0438' : 'Model Stats'}
          </Typography.Title>
        </div>
        <DataStatus {...modelStatsState} />
      </Flex>

      <section className="dashboard__stats">
        <StatCard label="ROI" value={`${(stats.roi * 100).toFixed(1)}%`} delta={isRu ? 'Walk-forward \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442' : 'Walk-forward paper result'} />
        <StatCard label="Yield" value={`${(stats.yieldRate * 100).toFixed(1)}%`} delta={isRu ? `${stats.sampleSize} \u0441\u0442\u0430\u0432\u043e\u043a` : `${stats.sampleSize} samples`} />
        <StatCard label="CLV" value={`${(stats.clv * 100).toFixed(1)}%`} delta={isRu ? '\u041a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043b\u0438\u043d\u0438\u0438 \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u044f' : 'Closing line quality'} />
        <StatCard label={isRu ? '\u041c\u0430\u043a\u0441. \u043f\u0440\u043e\u0441\u0430\u0434\u043a\u0430' : 'Max Drawdown'} value={`${(stats.maxDrawdown * 100).toFixed(1)}%`} delta={isRu ? '\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u0440\u0438\u0441\u043a\u0430' : 'Risk control metric'} />
      </section>

      <section className="dashboard__grid">
        <Card className="analytics-card" title={isRu ? '\u041a\u0430\u043b\u0438\u0431\u0440\u043e\u0432\u043a\u0430' : 'Calibration'} variant="borderless">
          <Descriptions
            column={1}
            items={[
              {key: 'brier', label: 'Brier score', children: stats.brierScore.toFixed(3)},
              {key: 'hit', label: 'Hit rate', children: `${(stats.hitRate * 100).toFixed(1)}%`},
              {key: 'sample', label: isRu ? '\u0420\u0430\u0437\u043c\u0435\u0440 \u0432\u044b\u0431\u043e\u0440\u043a\u0438' : 'Sample size', children: stats.sampleSize}
            ]}
          />
        </Card>

        <Card className="analytics-card" title={isRu ? '\u0413\u043e\u0442\u043e\u0432\u043d\u043e\u0441\u0442\u044c' : 'Readiness'} variant="borderless">
          <Space direction="vertical" size={14} className="full-width">
            <Typography.Text>{isRu ? '\u0412\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u044f \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u0435\u0439' : 'Probability validation'}</Typography.Text>
            <Progress percent={72} />
            <Typography.Text>{isRu ? '\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 leakage' : 'Leakage checks'}</Typography.Text>
            <Progress percent={48} />
            <Typography.Text>{isRu ? '\u041f\u043e\u043a\u0440\u044b\u0442\u0438\u0435 \u0431\u044d\u043a\u0442\u0435\u0441\u0442\u043e\u043c' : 'Backtest coverage'}</Typography.Text>
            <Progress percent={38} />
          </Space>
        </Card>
      </section>
    </main>
  );
}
