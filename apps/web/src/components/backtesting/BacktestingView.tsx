'use client';

import {Button, Segmented} from 'antd';
import {Play} from 'lucide-react';
import {mockOddsMovement} from '@/lib/mock-data';
import {OddsMovementChart} from '@/components/dashboard/OddsMovementChart';
import {StatCard} from '@/components/dashboard/StatCard';

export function BacktestingView() {
  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">Validation lab</p>
          <h2 className="page-header__title">Backtesting</h2>
        </div>
        <Button icon={<Play size={16} />}>Run Walk-Forward</Button>
      </section>

      <section className="dashboard__toolbar">
        <div className="dashboard__filters">
          <Segmented options={['30D', '90D', 'Season', 'Custom']} defaultValue="90D" />
          <Segmented options={['All', 'Premier League', 'La Liga', 'Serie A']} defaultValue="All" />
        </div>
      </section>

      <section className="dashboard__stats">
        <StatCard label="ROI" value="4.1%" delta="After flat-stake simulation" />
        <StatCard label="CLV" value="+2.4%" delta="Closing price advantage" />
        <StatCard label="Drawdown" value="-11.8%" delta="Max historical trough" />
        <StatCard label="Losing Streak" value="7" delta="Longest sequence" />
      </section>

      <section className="dashboard__grid">
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Profit Curve Placeholder</h3>
          </div>
          <OddsMovementChart data={mockOddsMovement} />
        </div>
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Validation Rules</h3>
          </div>
          <div className="metric-list">
            <div className="metric-list__row">
              <span>Time-series split</span>
              <strong>Required</strong>
            </div>
            <div className="metric-list__row">
              <span>No future data</span>
              <strong>Required</strong>
            </div>
            <div className="metric-list__row">
              <span>Historical odds snapshots</span>
              <strong>Required</strong>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
