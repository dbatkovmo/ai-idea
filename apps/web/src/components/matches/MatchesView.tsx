'use client';

import {Card, Flex, Segmented, Table, Tag, Typography, type TableColumnsType} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useMemo, useState} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {EmptyState} from '@/components/common/EmptyState';
import {fallbackData, getMatches} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';
import type {Match, MatchStatusFilter} from '@/types/analytics';

const statusLabels = {
  scheduled: '\u041f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u0438\u0439',
  live: 'Live',
  finished: '\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d',
  postponed: '\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0435\u043d',
  cancelled: '\u041e\u0442\u043c\u0435\u043d\u0435\u043d'
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
      title: isRu ? '\u041c\u0430\u0442\u0447' : 'Match',
      key: 'match',
      render: (_, row) => <Typography.Text strong>{row.homeTeam} - {row.awayTeam}</Typography.Text>
    },
    {title: isRu ? '\u041b\u0438\u0433\u0430' : 'League', dataIndex: 'league', key: 'league'},
    {title: isRu ? '\u041d\u0430\u0447\u0430\u043b\u043e' : 'Kickoff', dataIndex: 'kickoff', key: 'kickoff'},
    {
      title: isRu ? '\u041f1' : 'Home',
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
      title: isRu ? '\u041f2' : 'Away',
      dataIndex: 'awayProbability',
      key: 'awayProbability',
      render: (value: number) => `${(value * 100).toFixed(1)}%`
    },
    {
      title: isRu ? '\u0421\u0442\u0430\u0442\u0443\u0441' : 'Status',
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
    <main className="dashboard">
      <Flex className="page-header" align="center" justify="space-between" gap={18}>
        <div>
          <Typography.Text className="page-header__eyebrow">
            {isRu ? '\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c \u043c\u0430\u0442\u0447\u0435\u0439' : 'Fixture board'}
          </Typography.Text>
          <Typography.Title level={2} className="page-header__title">
            {isRu ? '\u041c\u0430\u0442\u0447\u0438' : 'Matches'}
          </Typography.Title>
        </div>
        <DataStatus {...matchesState} />
      </Flex>

      <Card className="filter-card" variant="borderless">
        <Segmented
          value={status}
          onChange={(value) => setStatus(value as MatchStatusFilter)}
          options={[
            {label: isRu ? '\u041f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u0438\u0435' : 'Upcoming', value: 'scheduled'},
            {label: isRu ? '\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u044b\u0435' : 'Finished', value: 'finished'},
            {label: isRu ? '\u0412\u0441\u0435' : 'All', value: 'all'}
          ]}
        />
      </Card>

      <Card
        className="analytics-card"
        title={isRu ? '\u041c\u0430\u0442\u0440\u0438\u0446\u0430 \u0432\u0435\u0440\u043e\u044f\u0442\u043d\u043e\u0441\u0442\u0435\u0439 1X2' : 'Pre-Match Probability Matrix'}
        extra={<Tag className="tag-soft">{isRu ? `${rows.length} \u043c\u0430\u0442\u0447\u0435\u0439` : `${rows.length} matches`}</Tag>}
        variant="borderless"
      >
        {rows.length === 0 ? (
          <EmptyState
            title={
              status === 'scheduled'
                ? isRu
                  ? '\u041f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u0438\u0445 \u043c\u0430\u0442\u0447\u0435\u0439 \u0441\u0435\u0439\u0447\u0430\u0441 \u043d\u0435\u0442. \u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0438 \u0444\u0438\u043b\u044c\u0442\u0440 \u043d\u0430 "\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u044b\u0435", \u0447\u0442\u043e\u0431\u044b \u043f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0438\u0441\u0442\u043e\u0440\u0438\u044e.'
                  : 'No upcoming matches. Switch to Finished to inspect historical fixtures.'
                : isRu
                  ? '\u041d\u0435\u0442 \u043c\u0430\u0442\u0447\u0435\u0439 \u043f\u043e\u0434 \u0442\u0435\u043a\u0443\u0449\u0438\u0439 \u0444\u0438\u043b\u044c\u0442\u0440.'
                  : 'No matches for the current filter.'
            }
          />
        ) : (
          <Table<Match>
            className="premium-table"
            columns={getColumns(isRu)}
            dataSource={rows}
            pagination={false}
            rowKey="id"
            scroll={{x: true}}
          />
        )}
      </Card>
    </main>
  );
}
