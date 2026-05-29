'use client';

import {Card, Col, Descriptions, Progress, Row, Space, Typography} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {StatCard} from '@/components/dashboard/StatCard';
import {PageContainer} from '@/components/layout/PageContainer';
import {PageHeader} from '@/components/layout/PageHeader';
import {useApiResource} from '@/hooks/use-api-resource';
import {fallbackData, getModelStats} from '@/lib/api';

export function ModelStatsView() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const loadModelStats = useCallback(() => getModelStats(), []);
  const modelStatsState = useApiResource(loadModelStats, fallbackData.modelStats);
  const stats = modelStatsState.data;

  return (
    <PageContainer>
      <PageHeader
        eyebrow={stats.modelVersion}
        title={isRu ? 'Статистика модели' : 'Model Stats'}
        extra={<DataStatus {...modelStatsState} />}
      />

      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label="ROI" value={`${(stats.roi * 100).toFixed(1)}%`} delta={isRu ? 'Walk-forward результат' : 'Walk-forward paper result'} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label="Yield" value={`${(stats.yieldRate * 100).toFixed(1)}%`} delta={isRu ? `${stats.sampleSize} ставок` : `${stats.sampleSize} samples`} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label="CLV" value={`${(stats.clv * 100).toFixed(1)}%`} delta={isRu ? 'Качество линии закрытия' : 'Closing line quality'} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={isRu ? 'Макс. просадка' : 'Max Drawdown'}
            value={`${(stats.maxDrawdown * 100).toFixed(1)}%`}
            delta={isRu ? 'Контроль риска' : 'Risk control metric'}
          />
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title={isRu ? 'Калибровка' : 'Calibration'} styles={{body: {padding: 20}}}>
            <Descriptions
              column={1}
              items={[
                {key: 'brier', label: 'Brier score', children: stats.brierScore.toFixed(3)},
                {key: 'hit', label: 'Hit rate', children: `${(stats.hitRate * 100).toFixed(1)}%`},
                {key: 'sample', label: isRu ? 'Размер выборки' : 'Sample size', children: stats.sampleSize}
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title={isRu ? 'Готовность' : 'Readiness'} styles={{body: {padding: 20}}}>
            <Space direction="vertical" size={14} style={{width: '100%'}}>
              <Typography.Text>{isRu ? 'Валидация вероятностей' : 'Probability validation'}</Typography.Text>
              <Progress percent={72} />
              <Typography.Text>{isRu ? 'Проверки leakage' : 'Leakage checks'}</Typography.Text>
              <Progress percent={48} />
              <Typography.Text>{isRu ? 'Покрытие бэктестом' : 'Backtest coverage'}</Typography.Text>
              <Progress percent={38} />
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
