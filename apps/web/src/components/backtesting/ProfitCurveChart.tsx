'use client';

import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type {ProfitCurvePoint} from '@/types/analytics';

type ProfitCurveChartProps = {
  data: ProfitCurvePoint[];
};

export function ProfitCurveChart({data}: ProfitCurveChartProps) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer>
        <LineChart data={data} margin={{top: 8, right: 12, bottom: 8, left: 0}}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="period" stroke="#71717A" tickLine={false} />
          <YAxis stroke="#71717A" tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip contentStyle={{background: '#171717', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12}} />
          <Line type="monotone" dataKey="bankroll" stroke="#10A37F" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="drawdown" stroke="#EF4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
