'use client';

import {Progress} from 'antd';
import {useCallback} from 'react';
import {DataStatus} from '@/components/common/DataStatus';
import {StatCard} from '@/components/dashboard/StatCard';
import {fallbackData, getModelStats} from '@/lib/api';
import {useApiResource} from '@/hooks/use-api-resource';

export function ModelStatsView() {
  const loadModelStats = useCallback(() => getModelStats(), []);
  const modelStatsState = useApiResource(loadModelStats, fallbackData.modelStats);
  const stats = modelStatsState.data;

  return (
    <main className="dashboard">
      <section className="page-header">
        <div>
          <p className="page-header__eyebrow">{stats.modelVersion}</p>
          <h2 className="page-header__title">Model Stats</h2>
        </div>
        <DataStatus {...modelStatsState} />
      </section>

      <section className="dashboard__stats">
        <StatCard label="ROI" value={`${(stats.roi * 100).toFixed(1)}%`} delta="Walk-forward paper result" />
        <StatCard label="Yield" value={`${(stats.yieldRate * 100).toFixed(1)}%`} delta={`${stats.sampleSize} samples`} />
        <StatCard label="CLV" value={`${(stats.clv * 100).toFixed(1)}%`} delta="Closing line quality" />
        <StatCard label="Max Drawdown" value={`${(stats.maxDrawdown * 100).toFixed(1)}%`} delta="Risk control metric" />
      </section>

      <section className="dashboard__grid">
        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Calibration</h3>
          </div>
          <div className="metric-list">
            <div className="metric-list__row">
              <span>Brier score</span>
              <strong>{stats.brierScore.toFixed(3)}</strong>
            </div>
            <div className="metric-list__row">
              <span>Hit rate</span>
              <strong>{(stats.hitRate * 100).toFixed(1)}%</strong>
            </div>
            <div className="metric-list__row">
              <span>Sample size</span>
              <strong>{stats.sampleSize}</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h3 className="panel__title">Readiness</h3>
          </div>
          <div className="readiness">
            <span>Probability validation</span>
            <Progress percent={72} strokeColor="#5cc8ff" trailColor="#202a39" />
            <span>Leakage checks</span>
            <Progress percent={48} strokeColor="#b6e26a" trailColor="#202a39" />
            <span>Backtest coverage</span>
            <Progress percent={38} strokeColor="#f4bf5f" trailColor="#202a39" />
          </div>
        </div>
      </section>
    </main>
  );
}
