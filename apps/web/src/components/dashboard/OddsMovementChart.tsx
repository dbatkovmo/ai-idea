'use client';

import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type {OddsPoint} from '@/types/analytics';

type OddsMovementChartProps = {
  data: OddsPoint[];
};

export function OddsMovementChart({data}: OddsMovementChartProps) {
  return (
    <div className="chart-frame">
      <ResponsiveContainer>
        <LineChart data={data} margin={{top: 8, right: 12, bottom: 8, left: 0}}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="time" stroke="#71717A" tickLine={false} />
          <YAxis stroke="#71717A" tickLine={false} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
          <Tooltip contentStyle={{background: '#171717', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12}} />
          <Line type="monotone" dataKey="opening" stroke="#71717A" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="current" stroke="#10A37F" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="fair" stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
