'use client';

import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type {ProfitCurvePoint} from '@/types/analytics';

type ProfitCurveChartProps = {
  data: ProfitCurvePoint[];
};

export function ProfitCurveChart({data}: ProfitCurveChartProps) {
  return (
    <div style={{width: '100%', height: 320}}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{top: 8, right: 12, bottom: 8, left: 0}}>
          <CartesianGrid stroke="#202a39" vertical={false} />
          <XAxis dataKey="period" stroke="#8d99aa" tickLine={false} />
          <YAxis stroke="#8d99aa" tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip contentStyle={{background: '#0d1118', border: '1px solid #202a39', borderRadius: 8}} />
          <Line type="monotone" dataKey="bankroll" stroke="#5cc8ff" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="drawdown" stroke="#ff6f6f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
