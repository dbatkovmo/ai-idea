'use client';

import {Tag} from 'antd';
import {useLocale} from 'next-intl';
import {useCallback} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {EmptyState} from '@/components/common/EmptyState';
import {fallbackData, getMatches} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';

export function MatchesView() {
  const locale = useLocale();
  const loadMatches = useCallback(() => getMatches(locale), [locale]);
  const matchesState = useApiResource(loadMatches, fallbackData.matches);

  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Fixture board</p>
          <h2 className="page-header__title">Matches</h2>
        </div>
        <DataStatus {...matchesState} />
      </section>

      <section className="panel">
        <div className="panel__header">
          <h3 className="panel__title">Pre-Match Probability Matrix</h3>
        </div>
        {matchesState.data.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table className="value-table">
              <thead className="value-table__head">
                <tr>
                  <th className="value-table__cell">Match</th>
                  <th className="value-table__cell">League</th>
                  <th className="value-table__cell">Kickoff</th>
                  <th className="value-table__cell">Home</th>
                  <th className="value-table__cell">Draw</th>
                  <th className="value-table__cell">Away</th>
                  <th className="value-table__cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {matchesState.data.map((match) => (
                  <tr className="value-table__row" key={match.id}>
                    <td className="value-table__cell">
                      <span className="value-table__match">
                        {match.homeTeam} vs {match.awayTeam}
                      </span>
                    </td>
                    <td className="value-table__cell">{match.league}</td>
                    <td className="value-table__cell">{match.kickoff}</td>
                    <td className="value-table__cell">{(match.homeProbability * 100).toFixed(1)}%</td>
                    <td className="value-table__cell">{(match.drawProbability * 100).toFixed(1)}%</td>
                    <td className="value-table__cell">{(match.awayProbability * 100).toFixed(1)}%</td>
                    <td className="value-table__cell">
                      <Tag color="blue">{match.status}</Tag>
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
