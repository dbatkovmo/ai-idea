'use client';

import {Segmented, Tag} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback, useMemo, useState} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {EmptyState} from '@/components/common/EmptyState';
import {fallbackData, getMatches} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';
import type {MatchStatusFilter} from '@/types/analytics';

const statusLabels = {
  scheduled: 'Предстоящий',
  live: 'Live',
  finished: 'Завершен',
  postponed: 'Перенесен',
  cancelled: 'Отменен'
} as const;

function statusColor(status: string) {
  if (status === 'scheduled') return 'green';
  if (status === 'finished') return 'default';
  if (status === 'live') return 'red';
  return 'orange';
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
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">{isRu ? 'Календарь матчей' : 'Fixture board'}</p>
          <h2 className="page-header__title">{isRu ? 'Матчи' : 'Matches'}</h2>
        </div>
        <DataStatus {...matchesState} />
      </section>

      <section className="dashboard__toolbar" aria-label={isRu ? 'Фильтры матчей' : 'Match filters'}>
        <Segmented
          value={status}
          onChange={(value) => setStatus(value as MatchStatusFilter)}
          options={[
            {label: isRu ? 'Предстоящие' : 'Upcoming', value: 'scheduled'},
            {label: isRu ? 'Завершенные' : 'Finished', value: 'finished'},
            {label: isRu ? 'Все' : 'All', value: 'all'}
          ]}
        />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h3 className="panel__title">{isRu ? 'Матрица вероятностей 1X2' : 'Pre-Match Probability Matrix'}</h3>
          <span className="data-pill">{isRu ? `${rows.length} матчей` : `${rows.length} matches`}</span>
        </div>
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
          <div style={{overflowX: 'auto'}}>
            <table className="value-table">
              <thead className="value-table__head">
                <tr>
                  <th className="value-table__cell">{isRu ? 'Матч' : 'Match'}</th>
                  <th className="value-table__cell">{isRu ? 'Лига' : 'League'}</th>
                  <th className="value-table__cell">{isRu ? 'Начало' : 'Kickoff'}</th>
                  <th className="value-table__cell">{isRu ? 'П1' : 'Home'}</th>
                  <th className="value-table__cell">{isRu ? 'X' : 'Draw'}</th>
                  <th className="value-table__cell">{isRu ? 'П2' : 'Away'}</th>
                  <th className="value-table__cell">{isRu ? 'Статус' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((match) => (
                  <tr className="value-table__row" key={match.id}>
                    <td className="value-table__cell">
                      <span className="value-table__match">
                        {match.homeTeam} - {match.awayTeam}
                      </span>
                    </td>
                    <td className="value-table__cell">{match.league}</td>
                    <td className="value-table__cell">{match.kickoff}</td>
                    <td className="value-table__cell">{(match.homeProbability * 100).toFixed(1)}%</td>
                    <td className="value-table__cell">{(match.drawProbability * 100).toFixed(1)}%</td>
                    <td className="value-table__cell">{(match.awayProbability * 100).toFixed(1)}%</td>
                    <td className="value-table__cell">
                      <Tag color={statusColor(match.status)}>
                        {isRu ? statusLabels[match.status as keyof typeof statusLabels] ?? match.status : match.status}
                      </Tag>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
