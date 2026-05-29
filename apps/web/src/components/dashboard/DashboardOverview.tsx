'use client';

import {Button, DatePicker, InputNumber, Select, Segmented} from 'antd';
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
  const loadOddsMovement = useCallback(
    () => getOddsMovement(activeMatchId, activeBet?.bookmaker, activeBet?.selection),
    [activeBet?.bookmaker, activeBet?.selection, activeMatchId]
  );
  const oddsMovementState = useApiResource(loadOddsMovement, mockOddsMovement);

  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">MVP analytics</p>
          <h2 className="page-header__title">Dashboard</h2>
        </div>
        <DataStatus
          isLoading={valueBetsState.isLoading || modelStatsState.isLoading}
          error={valueBetsState.error ?? modelStatsState.error}
          source={valueBetsState.source === 'api' && modelStatsState.source === 'api' ? 'api' : 'mock'}
        />
      </section>

      <section className="dashboard__toolbar" aria-label="Dashboard controls">
        <div className="dashboard__filters">
          <Select
            aria-label="League"
            value={league}
            style={{width: 180}}
            onChange={setLeague}
            options={[
              {value: 'all', label: 'All leagues'},
              {value: 'premier-league', label: 'Premier League'},
              {value: 'la-liga', label: 'La Liga'},
              {value: 'serie-a', label: 'Serie A'},
              {value: 'bundesliga', label: 'Bundesliga'},
              {value: 'ligue-1', label: 'Ligue 1'}
            ]}
          />
          <DatePicker.RangePicker aria-label="Date range" />
          <InputNumber
            aria-label="Minimum EV"
            min={0}
            max={0.3}
            step={0.01}
            value={minEv}
            prefix="EV"
            onChange={(value) => setMinEv(Number(value ?? 0))}
          />
          <Segmented options={['1X2']} value="1X2" />
        </div>
        <Button icon={<RefreshCcw size={16} />}>Sync Odds</Button>
      </section>

      <section className="dashboard__stats" aria-label="Model performance snapshot">
        <StatCard label="Active Value Bets" value={filteredBets.length.toString()} delta="+4 vs previous slate" />
        <StatCard
          label="Avg EV"
          value={`${((filteredBets.reduce((sum, bet) => sum + bet.ev, 0) / Math.max(filteredBets.length, 1)) * 100).toFixed(1)}%`}
          delta="+1.1 pp after filters"
        />
        <StatCard label="CLV Signal" value={`${(stats.clv * 100).toFixed(1)}%`} delta="Positive movement target" />
        <StatCard label="Calibration" value={stats.brierScore.toFixed(3)} delta="Brier score trailing 30d" />
      </section>

      <section className="dashboard__grid">
        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Value Bets</h2>
          </div>
          <ValueBetsTable bets={filteredBets} />
        </div>

        <div className="panel">
          <div className="panel__header">
            <h2 className="panel__title">Odds Movement</h2>
            <DataStatus {...oddsMovementState} />
          </div>
          <OddsMovementChart data={oddsMovementState.data} />
        </div>
      </section>
    </main>
  );
}
