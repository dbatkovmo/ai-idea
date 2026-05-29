'use client';

import {Button, Card, DatePicker, Flex, InputNumber, Select, Segmented, Statistic, Tag, Typography} from 'antd';
import {RefreshCcw} from 'lucide-react';
import {useLocale} from 'next-intl';
import {useCallback, useMemo} from 'react';
import {useDashboardStore} from '@/store/dashboard-store';
import {mockOddsMovement} from '@/lib/mock-data';
import {fallbackData, getModelStats, getOddsMovement, getValueBets} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';
import {DataStatus} from '@/components/common/DataStatus';
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
    <main className="dashboard">
      <Flex className="page-header" align="center" justify="space-between" gap={18}>
        <div>
          <Typography.Text className="page-header__eyebrow">{isRu ? 'AI analytics' : 'AI analytics'}</Typography.Text>
          <Typography.Title level={2} className="page-header__title">{isRu ? '\u0414\u0430\u0448\u0431\u043e\u0440\u0434' : 'Dashboard'}</Typography.Title>
        </div>
        <DataStatus
          isLoading={valueBetsState.isLoading || modelStatsState.isLoading}
          error={valueBetsState.error ?? modelStatsState.error}
          source={valueBetsState.source === 'api' && modelStatsState.source === 'api' ? 'api' : 'mock'}
        />
      </Flex>

      <Card className="filter-card" variant="borderless">
        <Flex wrap gap={10} align="center" justify="space-between">
          <Flex wrap gap={10} align="center">
          <Select
            aria-label={isRu ? '\u041b\u0438\u0433\u0430' : 'League'}
            className="filter-control"
            value={league}
            onChange={setLeague}
            options={[
              {value: 'all', label: isRu ? '\u0412\u0441\u0435 \u043b\u0438\u0433\u0438' : 'All leagues'},
              {value: 'premier-league', label: 'Premier League'},
              {value: 'la-liga', label: 'La Liga'},
              {value: 'serie-a', label: 'Serie A'},
              {value: 'bundesliga', label: 'Bundesliga'},
              {value: 'ligue-1', label: 'Ligue 1'}
            ]}
          />
          <DatePicker.RangePicker aria-label={isRu ? '\u0414\u0438\u0430\u043f\u0430\u0437\u043e\u043d \u0434\u0430\u0442' : 'Date range'} />
          <InputNumber
            aria-label={isRu ? '\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 EV' : 'Minimum EV'}
            min={0}
            max={0.3}
            step={0.01}
            value={minEv}
            prefix="EV"
            onChange={(value) => setMinEv(Number(value ?? 0))}
          />
          <Segmented options={['1X2']} value="1X2" />
          </Flex>
          <Button icon={<RefreshCcw size={16} />}>{isRu ? '\u0421\u0438\u043d\u0445\u0440. odds' : 'Sync Odds'}</Button>
        </Flex>
      </Card>

      <section className="dashboard__stats" aria-label={isRu ? '\u0421\u0432\u043e\u0434\u043a\u0430 \u043c\u043e\u0434\u0435\u043b\u0438' : 'Model performance snapshot'}>
        <StatCard
          label={isRu ? '\u0410\u043a\u0442\u0438\u0432\u043d\u044b\u0435 Value Bets' : 'Active Value Bets'}
          value={filteredBets.length.toString()}
          delta={isRu ? '\u041f\u043e \u0442\u0435\u043a\u0443\u0449\u0438\u043c \u0444\u0438\u043b\u044c\u0442\u0440\u0430\u043c' : 'After current filters'}
        />
        <StatCard
          label={isRu ? '\u0421\u0440\u0435\u0434\u043d\u0438\u0439 EV' : 'Avg EV'}
          value={`${(averageEv * 100).toFixed(1)}%`}
          delta={isRu ? '\u0421\u0440\u0435\u0434\u043d\u0435\u0435 \u043f\u043e \u0432\u044b\u0431\u043e\u0440\u043a\u0435' : 'Average after filters'}
        />
        <StatCard label="CLV" value={`${(stats.clv * 100).toFixed(1)}%`} delta={isRu ? '\u041a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u043b\u0438\u043d\u0438\u0438' : 'Closing line quality'} />
        <StatCard
          label={isRu ? '\u041a\u0430\u043b\u0438\u0431\u0440\u043e\u0432\u043a\u0430' : 'Calibration'}
          value={stats.brierScore.toFixed(3)}
          delta={isRu ? 'Brier score' : 'Brier score trailing 30d'}
        />
      </section>

      <section className="dashboard__grid">
        <Card className="analytics-card" title="Value Bets" variant="borderless">
          <ValueBetsTable bets={filteredBets} />
        </Card>

        <Card
          className="analytics-card"
          title={isRu ? '\u0414\u0432\u0438\u0436\u0435\u043d\u0438\u0435 odds' : 'Odds Movement'}
          extra={
              <Select
                aria-label={isRu ? '\u0420\u044b\u043d\u043e\u043a' : 'Market'}
                className="filter-control"
                value="all"
                options={[{value: 'all', label: isRu ? '\u0412\u0441\u0435 \u0440\u044b\u043d\u043a\u0438' : 'All markets'}]}
              />
          }
          variant="borderless"
        >
          <div className="chart-legend">
            <span className="chart-legend__item"><span className="chart-legend__dot" />Current</span>
            <span className="chart-legend__item"><span className="chart-legend__dot chart-legend__dot--blue" />Fair</span>
          </div>
          <OddsMovementChart data={oddsMovementState.data} />
        </Card>
      </section>

      <Card className="summary-card" variant="borderless">
      <section className="summary-bar" aria-label={isRu ? '\u0421\u0432\u043e\u0434\u043d\u0430\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430' : 'Analytics summary'}>
        <div className="summary-bar__item">
          <Statistic title="ROI" value={`${(stats.roi * 100).toFixed(1)}%`} />
          <Tag className="tag-soft">{isRu ? '\u041c\u043e\u0434\u0435\u043b\u044c \u0432 \u043f\u043b\u044e\u0441\u0435' : 'Positive model result'}</Tag>
        </div>
        <div className="summary-bar__item">
          <Statistic title="Yield" value={`${(stats.yieldRate * 100).toFixed(1)}%`} />
          <Tag className="tag-soft">{isRu ? '\u041d\u0430 \u0432\u044b\u0431\u043e\u0440\u043a\u0435' : 'On sample'}</Tag>
        </div>
        <div className="summary-bar__item">
          <Statistic title={isRu ? '\u0412\u044b\u0431\u043e\u0440\u043a\u0430' : 'Sample'} value={stats.sampleSize} />
          <Tag className="tag-soft">{isRu ? '\u0412\u0430\u043b\u0438\u0434\u0438\u0440\u0443\u0435\u0442\u0441\u044f' : 'In validation'}</Tag>
        </div>
        <div className="summary-bar__item">
          <Statistic title={isRu ? '\u041f\u0440\u043e\u0441\u0430\u0434\u043a\u0430' : 'Drawdown'} value={`${(stats.maxDrawdown * 100).toFixed(1)}%`} />
          <Tag className="tag-soft">{isRu ? '\u041a\u043e\u043d\u0442\u0440\u043e\u043b\u044c \u0440\u0438\u0441\u043a\u0430' : 'Risk controlled'}</Tag>
        </div>
      </section>
      </Card>
    </main>
  );
}
