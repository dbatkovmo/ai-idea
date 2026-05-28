'use client';

import {DatePicker, InputNumber, Select, Segmented} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useMemo} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {EmptyState} from '@/components/common/EmptyState';
import {ValueBetsTable} from '@/components/dashboard/ValueBetsTable';
import {fallbackData, getValueBets} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';
import {useDashboardStore} from '@/store/dashboard-store';

export function ValueBetsView() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const {league, minEv, setLeague, setMinEv} = useDashboardStore();
  const loadValueBets = useCallback(() => getValueBets(minEv, locale), [locale, minEv]);
  const valueBetsState = useApiResource(loadValueBets, fallbackData.valueBets);
  const filteredBets = useMemo(
    () => valueBetsState.data.filter((bet) => (league === 'all' || bet.leagueSlug === league) && bet.ev >= minEv),
    [league, minEv, valueBetsState.data]
  );

  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">{isRu ? 'Рыночное преимущество' : 'Market edge'}</p>
          <h2 className="page-header__title">{isRu ? 'Value Bets' : 'Value Bets'}</h2>
        </div>
        <DataStatus {...valueBetsState} />
      </section>

      <section className="dashboard__toolbar" aria-label="Value bet filters">
        <div className="dashboard__filters">
          <Select
            aria-label="League"
            value={league}
            style={{width: 180}}
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
      </section>

      <section className="panel">
        <div className="panel__header">
          <h3 className="panel__title">{isRu ? 'Отобранные 1X2 сигналы' : 'Qualified 1X2 Signals'}</h3>
          <span className="data-pill">{isRu ? `${filteredBets.length} активных` : `${filteredBets.length} active`}</span>
        </div>
        {filteredBets.length === 0 ? <EmptyState /> : <ValueBetsTable bets={filteredBets} />}
      </section>
    </main>
  );
}
