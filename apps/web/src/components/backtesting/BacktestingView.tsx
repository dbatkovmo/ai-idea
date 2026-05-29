'use client';

import {Button, Card, Flex, List, Segmented, Tag, Typography} from 'antd';
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

  const validationRules = [
    isRu ? '\u0420\u0430\u0437\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043f\u043e \u0432\u0440\u0435\u043c\u0435\u043d\u0438' : 'Time-series split',
    isRu ? '\u0411\u0435\u0437 \u0431\u0443\u0434\u0443\u0449\u0438\u0445 \u0434\u0430\u043d\u043d\u044b\u0445' : 'No future data',
    isRu ? '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442\u043e\u0432' : 'Historical odds snapshots'
  ];

  return (
    <main className="dashboard">
      <Flex className="page-header" align="center" justify="space-between" gap={18}>
        <div>
          <Typography.Text className="page-header__eyebrow">
            {isRu ? '\u041b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u0438\u044f \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u0438' : 'Validation lab'}
          </Typography.Text>
          <Typography.Title level={2} className="page-header__title">
            {isRu ? '\u0411\u044d\u043a\u0442\u0435\u0441\u0442\u0438\u043d\u0433' : 'Backtesting'}
          </Typography.Title>
        </div>
        <Button icon={<Play size={16} />} loading={isRunning} onClick={handleRun}>
          {isRu ? '\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u044c walk-forward' : 'Run Walk-Forward'}
        </Button>
      </Flex>

      <Card className="filter-card" variant="borderless">
        <Flex wrap gap={10} align="center" justify="space-between">
          <Flex wrap gap={10} align="center">
            <Segmented options={['30D', '90D', 'Season', 'Custom']} value={window} onChange={(value) => setWindow(String(value))} />
            <Segmented
              options={[
                {label: isRu ? '\u0412\u0441\u0435' : 'All', value: 'all'},
                {label: 'Premier League', value: 'premier-league'},
                {label: 'La Liga', value: 'la-liga'},
                {label: 'Serie A', value: 'serie-a'}
              ]}
              value={league}
              onChange={(value) => setLeague(String(value))}
            />
          </Flex>
          <DataStatus {...backtestState} />
        </Flex>
      </Card>

      <section className="dashboard__stats">
        <StatCard label="ROI" value={`${(result.roi * 100).toFixed(1)}%`} delta={isRu ? `${result.sampleSize} \u0441\u0442\u0430\u0432\u043e\u043a` : `${result.sampleSize} samples`} />
        <StatCard label="CLV" value={`+${(result.clv * 100).toFixed(1)}%`} delta={isRu ? '\u041f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u043e \u043a \u0437\u0430\u043a\u0440\u044b\u0442\u0438\u044e \u043b\u0438\u043d\u0438\u0438' : 'Closing price advantage'} />
        <StatCard label={isRu ? '\u041f\u0440\u043e\u0441\u0430\u0434\u043a\u0430' : 'Drawdown'} value={`${(result.maxDrawdown * 100).toFixed(1)}%`} delta={isRu ? '\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u0430\u044f \u0438\u0441\u0442\u043e\u0440\u0438\u0447\u0435\u0441\u043a\u0430\u044f' : 'Max historical trough'} />
        <StatCard label={isRu ? '\u0421\u0435\u0440\u0438\u044f \u043c\u0438\u043d\u0443\u0441\u043e\u0432' : 'Losing Streak'} value={result.losingStreak.toString()} delta={isRu ? '\u0421\u0430\u043c\u0430\u044f \u0434\u043b\u0438\u043d\u043d\u0430\u044f \u0441\u0435\u0440\u0438\u044f' : 'Longest sequence'} />
      </section>

      <section className="dashboard__grid">
        <Card
          className="analytics-card"
          title={isRu ? '\u041a\u0440\u0438\u0432\u0430\u044f \u043f\u0440\u0438\u0431\u044b\u043b\u0438' : 'Profit Curve'}
          extra={<Tag className="tag-soft">{`${result.window} · ${result.league}`}</Tag>}
          variant="borderless"
        >
          <ProfitCurveChart data={result.profitCurve} />
        </Card>
        <Card className="analytics-card" title={isRu ? '\u041f\u0440\u0430\u0432\u0438\u043b\u0430 \u0432\u0430\u043b\u0438\u0434\u0430\u0446\u0438\u0438' : 'Validation Rules'} variant="borderless">
          <List
            dataSource={validationRules}
            renderItem={(rule) => (
              <List.Item>
                <Typography.Text>{rule}</Typography.Text>
                <Tag className="tag-soft">{isRu ? '\u041e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e' : 'Required'}</Tag>
              </List.Item>
            )}
          />
        </Card>
      </section>
    </main>
  );
}
