'use client';

import {PlayCircleOutlined} from '@ant-design/icons';
import {Button, Card, Col, Flex, List, Row, Segmented, Tag, Typography} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useState} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {StatCard} from '@/components/dashboard/StatCard';
import {FilterCard} from '@/components/layout/FilterCard';
import {PageContainer} from '@/components/layout/PageContainer';
import {PageHeader} from '@/components/layout/PageHeader';
import {useApiResource} from '@/hooks/use-api-resource';
import {fallbackData, getLatestBacktest, runBacktest} from '@/lib/api';
import {ProfitCurveChart} from './ProfitCurveChart';

export function BacktestingView() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const [window, setWindow] = useState('90D');
  const [league, setLeague] = useState('all');
  const [isRunning, setIsRunning] = useState(false);
  const loadBacktest = useCallback(() => getLatestBacktest(), []);
  const backtestState = useApiResource(loadBacktest, fallbackData.backtestResult);
  const [manualResult, setManualResult] = useState(backtestState.data);
  const result = manualResult.id === backtestState.data.id ? backtestState.data : manualResult;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      setManualResult(await runBacktest(window, league));
    } finally {
      setIsRunning(false);
    }
  };

  const validationRules = [
    isRu ? 'Разделение по времени' : 'Time-series split',
    isRu ? 'Без будущих данных' : 'No future data',
    isRu ? 'История коэффициентов' : 'Historical odds snapshots'
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow={isRu ? 'Лаборатория валидации' : 'Validation lab'}
        title={isRu ? 'Бэктестинг' : 'Backtesting'}
        extra={
          <Button icon={<PlayCircleOutlined />} loading={isRunning} onClick={handleRun} type="primary">
            {isRu ? 'Запустить walk-forward' : 'Run Walk-Forward'}
          </Button>
        }
      />

      <FilterCard>
        <Flex wrap gap={12} align="center" justify="space-between">
          <Flex wrap gap={10} align="center">
            <Segmented
              style={{width: 210}}
              options={['30D', '90D', 'Season', 'Custom']}
              value={window}
              onChange={(value) => setWindow(String(value))}
            />
            <Segmented
              style={{width: 266}}
              options={[
                {label: isRu ? 'Все' : 'All', value: 'all'},
                {label: 'Premier League', value: 'premier-league'},
                {label: 'La Liga', value: 'la-liga'},
                {label: 'Serie A', value: 'serie-a'}
              ]}
              value={league}
              onChange={(value) => setLeague(String(value))}
            />
          </Flex>
          <DataStatus {...backtestState} />
        </Flex>
      </FilterCard>

      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label="ROI" value={`${(result.roi * 100).toFixed(1)}%`} delta={isRu ? `${result.sampleSize} ставок` : `${result.sampleSize} samples`} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label="CLV" value={`+${(result.clv * 100).toFixed(1)}%`} delta={isRu ? 'Преимущество к закрытию линии' : 'Closing price advantage'} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label={isRu ? 'Просадка' : 'Drawdown'} value={`${(result.maxDrawdown * 100).toFixed(1)}%`} delta={isRu ? 'Максимальная историческая' : 'Max historical trough'} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label={isRu ? 'Серия минусов' : 'Losing Streak'} value={result.losingStreak.toString()} delta={isRu ? 'Самая длинная серия' : 'Longest sequence'} />
        </Col>
      </Row>

      <Row gutter={[18, 18]}>
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            title={isRu ? 'Кривая прибыли' : 'Profit Curve'}
            extra={<Tag>{`${result.window} · ${result.league}`}</Tag>}
            styles={{body: {padding: 20}}}
          >
            <ProfitCurveChart data={result.profitCurve} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card bordered={false} title={isRu ? 'Правила валидации' : 'Validation Rules'} styles={{body: {padding: 20}}}>
            <List
              dataSource={validationRules}
              renderItem={(rule) => (
                <List.Item
                  actions={[<Tag key="required">{isRu ? 'Обязательно' : 'Required'}</Tag>]}
                >
                  <Typography.Text>{rule}</Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}
