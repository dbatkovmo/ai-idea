'use client';

import {Button, Segmented} from 'antd';
import {Play} from 'lucide-react';
import {useLocale} from 'next-intl';
import {useCallback, useState} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {StatCard} from '@/components/dashboard/StatCard';
import {fallbackData, getLatestBacktest, runBacktest} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';
import {ProfitCurveChart} from './ProfitCurveChart';

export function BacktestingView() {
  const locale = useLocale();
  const isRu = locale !== 'en';
  const [window, setWindow] = useState('90D');
  const [league, setLeague] = useState('all');
  const [isRunning, setIsRunning] = useState(false);
  const loadBacktest = useCallback(() => getLatestBacktest(), []);
  const backtestState = useApiResource(loadBacktest, fallbackData.backtestResult);
  const [manualResult, setManualResult] = useState(backtestState.data);
  const result = manualResult.id === backtestState.data.id ? backtestState.data : manualResult;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      setManualResult(await runBacktest(window, league));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">{isRu ? 'Лаборатория валидации' : 'Validation lab'}</p>
          <h2 className="page-header__title">{isRu ? 'Бэктестинг' : 'Backtesting'}</h2>
        </div>
        <Button icon={<Play size={16} />} loading={isRunning} onClick={handleRun}>
          {isRu ? 'Запустить walk-forward' : 'Run Walk-Forward'}
        </Button>
      </section>

      <section className="dashboard__toolbar">
        <div className="dashboard__filters">
          <Segmented options={['30D', '90D', 'Season', 'Custom']} value={window} onChange={(value) => setWindow(String(value))} />
          <Segmented
            options={[
              {label: isRu ? 'Все' : 'All', value: 'all'},
              {label: 'Premier League', value: 'premier-league'},
              {label: 'La Liga', value: 'la-liga'},
              {label: 'Serie A', value: 'serie-a'}
            ]}
            value={league}
            onChange={(value) => setLeague(String(value))}
          />
        </div>
        <DataStatus {...backtestState} />
      </section>

      <section className="dashboard__stats">
        <StatCard label="ROI" value={`${(result.roi * 100).toFixed(1)}%`} delta={isRu ? `${result.sampleSize} ставок` : `${result.sampleSize} samples`} />
        <StatCard label="CLV" value={`+${(result.clv * 100).toFixed(1)}%`} delta={isRu ? 'Преимущество к закрытию линии' : 'Closing price advantage'} />
        <StatCard label={isRu ? 'Просадка' : 'Drawdown'} value={`${(result.maxDrawdown * 100).toFixed(1)}%`} delta={isRu ? 'Максимальная историческая' : 'Max historical trough'} />
        <StatCard label={isRu ? 'Серия минусов' : 'Losing Streak'} value={result.losingStreak.toString()} delta={isRu ? 'Самая длинная серия' : 'Longest sequence'} />
      </section>

      <section className="dashboard__grid">
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">{isRu ? 'Кривая прибыли' : 'Profit Curve'}</h3>
            <span className="data-pill">{`${result.window} · ${result.league}`}</span>
          </div>
          <ProfitCurveChart data={result.profitCurve} />
        </div>
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">{isRu ? 'Правила валидации' : 'Validation Rules'}</h3>
          </div>
          <div className="metric-list">
            <div className="metric-list__row">
              <span>{isRu ? '\u0420\u0430\u0437\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043f\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438' : 'Time-series split'}</span>
              <strong>{isRu ? 'Обязательно' : 'Required'}</strong>
            </div>
            <div className="metric-list__row">
              <span>{isRu ? 'Без будущих данных' : 'No future data'}</span>
              <strong>{isRu ? 'Обязательно' : 'Required'}</strong>
            </div>
            <div className="metric-list__row">
              <span>{isRu ? 'История коэффициентов' : 'Historical odds snapshots'}</span>
              <strong>{isRu ? 'Обязательно' : 'Required'}</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
