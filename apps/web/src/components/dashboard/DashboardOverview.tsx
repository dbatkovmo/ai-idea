'use client';

import {SyncOutlined} from '@ant-design/icons';
import {Badge, Button, Card, Col, DatePicker, Flex, InputNumber, Row, Select, Segmented, Statistic, Tag, Typography} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useMemo} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {FilterCard} from '@/components/layout/FilterCard';
import {PageContainer} from '@/components/layout/PageContainer';
import {PageHeader} from '@/components/layout/PageHeader';
import {useApiResource} from '@/hooks/use-api-resource';
import {fallbackData, getModelStats, getOddsMovement, getValueBets} from '@/lib/api';
import {mockOddsMovement} from '@/lib/mock-data';
import {useDashboardStore} from '@/store/dashboard-store';
import {OddsMovementChart} from './OddsMovementChart';
import {StatCard} from './StatCard';
import {ValueBetsTable} from './ValueBetsTable';

export function DashboardOverview() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const {league, minEv, setLeague, setMinEv} = useDashboardStore();
  const loadValueBets = useCallback(() => getValueBets(minEv, locale, league), [league, locale, minEv]);
  const loadModelStats = useCallback(() => getModelStats(), []);
  const valueBetsState = useApiResource(loadValueBets, fallbackData.valueBets);
  const modelStatsState = useApiResource(loadModelStats, fallbackData.modelStats);

  const filteredBets = useMemo(
    () => valueBetsState.data.filter((bet) => (league === 'all' || bet.leagueSlug === league) && bet.ev >= minEv),
    [league, minEv, valueBetsState.data]
  );
  const stats = modelStatsState.data;
  const activeBet = filteredBets[0];
  const activeMatchId = activeBet?.matchId ?? 'match-001';
  const averageEv = filteredBets.reduce((sum, bet) => sum + bet.ev, 0) / Math.max(filteredBets.length, 1);
  const loadOddsMovement = useCallback(
    () => getOddsMovement(activeMatchId, activeBet?.bookmaker, activeBet?.selection),
    [activeBet?.bookmaker, activeBet?.selection, activeMatchId]
  );
  const oddsMovementState = useApiResource(loadOddsMovement, mockOddsMovement);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="AI analytics"
        title={isRu ? 'Дашборд' : 'Dashboard'}
        extra={
          <DataStatus
            isLoading={valueBetsState.isLoading || modelStatsState.isLoading}
            error={valueBetsState.error ?? modelStatsState.error}
            source={valueBetsState.source === 'api' && modelStatsState.source === 'api' ? 'api' : 'mock'}
          />
        }
      />

      <FilterCard>
        <Flex wrap gap={12} align="center" justify="space-between">
          <Flex wrap gap={10} align="center" style={{flex: 1}}>
            <Select
              aria-label={isRu ? 'Лига' : 'League'}
              style={{width: 162}}
              value={league}
              onChange={setLeague}
              options={[
                {value: 'all', label: isRu ? 'Все лиги' : 'All leagues'},
                {value: 'premier-league', label: 'Premier League'},
                {value: 'la-liga', label: 'La Liga'},
                {value: 'serie-a', label: 'Serie A'},
                {value: 'bundesliga', label: 'Bundesliga'},
                {value: 'ligue-1', label: 'Ligue 1'}
              ]}
            />
            <DatePicker.RangePicker
              aria-label={isRu ? 'Диапазон дат' : 'Date range'}
              style={{width: 264}}
            />
            <InputNumber
              aria-label={isRu ? 'Минимальный EV' : 'Minimum EV'}
              style={{width: 88}}
              min={0}
              max={0.3}
              step={0.01}
              value={minEv}
              prefix="EV"
              onChange={(value) => setMinEv(Number(value ?? 0))}
            />
            <Segmented options={[{label: '1X2', value: '1X2'}]} value="1X2" />
          </Flex>
          <Button icon={<SyncOutlined />}>{isRu ? 'Синхр. odds' : 'Sync Odds'}</Button>
        </Flex>
      </FilterCard>

      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={isRu ? 'Активные Value Bets' : 'Active Value Bets'}
            value={filteredBets.length.toString()}
            delta={isRu ? 'По текущим фильтрам' : 'After current filters'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={isRu ? 'Средний EV' : 'Avg EV'}
            value={`${(averageEv * 100).toFixed(1)}%`}
            delta={isRu ? 'Среднее по выборке' : 'Average after filters'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard label="CLV" value={`${(stats.clv * 100).toFixed(1)}%`} delta={isRu ? 'Качество линии' : 'Closing line quality'} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={isRu ? 'Калибровка' : 'Calibration'}
            value={stats.brierScore.toFixed(3)}
            delta={isRu ? 'Brier score' : 'Brier score trailing 30d'}
          />
        </Col>
      </Row>

      <Row gutter={[18, 18]} align="top">
        <Col xs={24} lg={14}>
          <Card bordered={false} title="Value Bets" styles={{body: {padding: 20}}}>
            <ValueBetsTable bets={filteredBets} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            title={isRu ? 'Движение odds' : 'Odds Movement'}
            extra={
              <Select
                aria-label={isRu ? 'Рынок' : 'Market'}
                style={{width: 140}}
                value="all"
                options={[{value: 'all', label: isRu ? 'Все рынки' : 'All markets'}]}
              />
            }
            styles={{body: {padding: 20}}}
          >
            <Flex gap={14} style={{marginBottom: 12}}>
              <Flex align="center" gap={6}>
                <Badge color="#10A37F" />
                <Typography.Text type="secondary" style={{fontSize: 12}}>
                  Current
                </Typography.Text>
              </Flex>
              <Flex align="center" gap={6}>
                <Badge color="#3B82F6" />
                <Typography.Text type="secondary" style={{fontSize: 12}}>
                  Fair
                </Typography.Text>
              </Flex>
            </Flex>
            <OddsMovementChart data={oddsMovementState.data} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} styles={{body: {padding: '20px 24px'}}}>
        <Row gutter={[24, 16]}>
          <Col xs={12} sm={12} lg={6}>
            <Statistic title="ROI" value={`${(stats.roi * 100).toFixed(1)}%`} />
            <Tag style={{marginTop: 8}}>{isRu ? 'Модель в плюсе' : 'Positive model result'}</Tag>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Statistic title="Yield" value={`${(stats.yieldRate * 100).toFixed(1)}%`} />
            <Tag style={{marginTop: 8}}>{isRu ? 'На выборке' : 'On sample'}</Tag>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Statistic title={isRu ? 'Выборка' : 'Sample'} value={stats.sampleSize} />
            <Tag style={{marginTop: 8}}>{isRu ? 'Валидируется' : 'In validation'}</Tag>
          </Col>
          <Col xs={12} sm={12} lg={6}>
            <Statistic title={isRu ? 'Просадка' : 'Drawdown'} value={`${(stats.maxDrawdown * 100).toFixed(1)}%`} />
            <Tag style={{marginTop: 8}}>{isRu ? 'Контроль риска' : 'Risk controlled'}</Tag>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
}
