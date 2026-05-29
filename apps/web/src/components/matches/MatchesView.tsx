'use client';

import {Card, Segmented, Table, Tag, Typography, type TableColumnsType} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useMemo, useState} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {EmptyState} from '@/components/common/EmptyState';
import {FilterCard} from '@/components/layout/FilterCard';
import {PageContainer} from '@/components/layout/PageContainer';
import {PageHeader} from '@/components/layout/PageHeader';
import {useApiResource} from '@/hooks/use-api-resource';
import {fallbackData, getMatches} from '@/lib/api';
import type {Match, MatchStatusFilter} from '@/types/analytics';

const statusLabels = {
  scheduled: 'предстоящий',
  live: 'Live',
  finished: 'Завершен',
  postponed: 'Перенесен',
  cancelled: 'Отменен'
} as const;

function statusColor(status: string) {
  if (status === 'scheduled') return 'success';
  if (status === 'finished') return 'default';
  if (status === 'live') return 'error';
  return 'warning';
}

function getColumns(isRu: boolean): TableColumnsType<Match> {
  return [
    {
      title: isRu ? 'Матч' : 'Match',
      key: 'match',
      render: (_, row) => (
        <Typography.Text strong>
          {row.homeTeam} - {row.awayTeam}
        </Typography.Text>
      )
    },
    {title: isRu ? 'Лига' : 'League', dataIndex: 'league', key: 'league'},
    {title: isRu ? 'Начало' : 'Kickoff', dataIndex: 'kickoff', key: 'kickoff'},
    {
      title: isRu ? 'П1' : 'Home',
      dataIndex: 'homeProbability',
      key: 'homeProbability',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    },
    {
      title: 'X',
      dataIndex: 'drawProbability',
      key: 'drawProbability',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    },
    {
      title: isRu ? 'П2' : 'Away',
      dataIndex: 'awayProbability',
      key: 'awayProbability',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    },
    {
      title: isRu ? 'Статус' : 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColor(status)}>
          {isRu ? statusLabels[status as keyof typeof statusLabels] ?? status : status}
        </Tag>
      )
    }
  ];
}

export function MatchesView() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const [status, setStatus] = useState<MatchStatusFilter>('scheduled');
  const loadMatches = useCallback(() => getMatches(locale, status), [locale, status]);
  const matchesState = useApiResource(loadMatches, status === 'scheduled' ? [] : fallbackData.matches);
  const rows = useMemo(() => matchesState.data, [matchesState.data]);

  return (
    <PageContainer fill>
      <PageHeader
        eyebrow={isRu ? 'Календарь матчей' : 'Fixture board'}
        title={isRu ? 'Матчи' : 'Matches'}
        extra={<DataStatus {...matchesState} />}
      />

      <FilterCard>
        <Segmented
          value={status}
          onChange={(value) => setStatus(value as MatchStatusFilter)}
          options={[
            {label: isRu ? 'Предстоящие' : 'Upcoming', value: 'scheduled'},
            {label: isRu ? 'Завершенные' : 'Finished', value: 'finished'},
            {label: isRu ? 'Все' : 'All', value: 'all'}
          ]}
        />
      </FilterCard>

      <Card
        bordered={false}
        title={isRu ? 'Матрица вероятностей 1X2' : 'Pre-Match Probability Matrix'}
        extra={<Tag>{isRu ? `${rows.length} матчей` : `${rows.length} matches`}</Tag>}
        styles={{body: {padding: 20, flex: 1, minHeight: 0}}}
        style={{flex: 1, display: 'flex', flexDirection: 'column'}}
      >
        {rows.length === 0 ? (
          <EmptyState
            title={
              status === 'scheduled'
                ? isRu
                  ? 'Предстоящих матчей сейчас нет. Переключи фильтр на "Завершенные", чтобы посмотреть историю.'
                  : 'No upcoming matches. Switch to Finished to inspect historical fixtures.'
                : isRu
                  ? 'Нет матчей под текущий фильтр.'
                  : 'No matches for the current filter.'
            }
          />
        ) : (
          <Table<Match>
            columns={getColumns(isRu)}
            dataSource={rows}
            pagination={false}
            rowKey="id"
            scroll={{x: true, y: 'calc(100vh - 360px)'}}
            size="middle"
          />
        )}
      </Card>
    </PageContainer>
  );
}
