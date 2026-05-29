'use client';

import {Card, DatePicker, Flex, InputNumber, Segmented, Select, Tag} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useMemo} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {EmptyState} from '@/components/common/EmptyState';
import {ValueBetsTable} from '@/components/dashboard/ValueBetsTable';
import {FilterCard} from '@/components/layout/FilterCard';
import {PageContainer} from '@/components/layout/PageContainer';
import {PageHeader} from '@/components/layout/PageHeader';
import {useApiResource} from '@/hooks/use-api-resource';
import {fallbackData, getValueBets} from '@/lib/api';
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
    <PageContainer fill>
      <PageHeader
        eyebrow={isRu ? 'Рыночное преимущество' : 'Market edge'}
        title="Value Bets"
        extra={<DataStatus {...valueBetsState} />}
      />

      <FilterCard>
        <Flex wrap gap={10} align="center">
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
      </FilterCard>

      <Card
        bordered={false}
        title={isRu ? 'Отобранные 1X2-сигналы' : 'Qualified 1X2 Signals'}
        extra={<Tag>{isRu ? `${filteredBets.length} активных` : `${filteredBets.length} active`}</Tag>}
        styles={{body: {padding: 20}}}
        style={{flex: 1}}
      >
        {filteredBets.length === 0 ? (
          <EmptyState />
        ) : (
          <ValueBetsTable bets={filteredBets} scrollY="calc(100vh - 360px)" />
        )}
      </Card>
    </PageContainer>
  );
}
