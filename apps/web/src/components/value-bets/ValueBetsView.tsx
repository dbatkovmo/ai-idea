'use client';

import {Card, DatePicker, Flex, InputNumber, Select, Segmented, Tag, Typography} from 'antd';
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
  const loadValueBets = useCallback(() => getValueBets(minEv, locale, league), [league, locale, minEv]);
  const valueBetsState = useApiResource(loadValueBets, fallbackData.valueBets);
  const filteredBets = useMemo(
    () => valueBetsState.data.filter((bet) => (league === 'all' || bet.leagueSlug === league) && bet.ev >= minEv),
    [league, minEv, valueBetsState.data]
  );

  return (
    <main className="dashboard">
      <Flex className="page-header" align="center" justify="space-between" gap={18}>
        <div>
          <Typography.Text className="page-header__eyebrow">
            {isRu ? '\u0420\u044b\u043d\u043e\u0447\u043d\u043e\u0435 \u043f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u043e' : 'Market edge'}
          </Typography.Text>
          <Typography.Title level={2} className="page-header__title">Value Bets</Typography.Title>
        </div>
        <DataStatus {...valueBetsState} />
      </Flex>

      <Card className="filter-card" variant="borderless">
        <Flex className="filter-card__controls" wrap gap={10} align="center">
          <Select
            aria-label={isRu ? '\u041b\u0438\u0433\u0430' : 'League'}
            className="filter-control filter-control--league"
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
          <DatePicker.RangePicker
            aria-label={isRu ? '\u0414\u0438\u0430\u043f\u0430\u0437\u043e\u043d \u0434\u0430\u0442' : 'Date range'}
            className="filter-control filter-control--date"
          />
          <InputNumber
            aria-label={isRu ? '\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 EV' : 'Minimum EV'}
            className="filter-control filter-control--ev"
            min={0}
            max={0.3}
            step={0.01}
            value={minEv}
            prefix="EV"
            onChange={(value) => setMinEv(Number(value ?? 0))}
          />
          <Segmented className="market-switch" options={[{label: '1X2', value: '1X2'}]} value="1X2" />
        </Flex>
      </Card>

      <Card
        className="analytics-card"
        title={isRu ? '\u041e\u0442\u043e\u0431\u0440\u0430\u043d\u043d\u044b\u0435 1X2-\u0441\u0438\u0433\u043d\u0430\u043b\u044b' : 'Qualified 1X2 Signals'}
        extra={<Tag className="tag-soft">{isRu ? `${filteredBets.length} \u0430\u043a\u0442\u0438\u0432\u043d\u044b\u0445` : `${filteredBets.length} active`}</Tag>}
        variant="borderless"
      >
        {filteredBets.length === 0 ? <EmptyState /> : <ValueBetsTable bets={filteredBets} />}
      </Card>
    </main>
  );
}
