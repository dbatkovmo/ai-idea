'use client';

import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type {OddsPoint} from '@/types/analytics';

type OddsMovementChartProps = {
  data: OddsPoint[];
};

export function OddsMovementChart({data}: OddsMovementChartProps) {
  return (
    <div style={{width: '100%', height: 320}}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{top: 8, right: 12, bottom: 8, left: 0}}>
          <CartesianGrid stroke="#202a39" vertical={false} />
          <XAxis dataKey="time" stroke="#8d99aa" tickLine={false} />
          <YAxis stroke="#8d99aa" tickLine={false} domain={['dataMin - 0.05', 'dataMax + 0.05']} />
          <Tooltip contentStyle={{background: '#0d1118', border: '1px solid #202a39', borderRadius: 8}} />
          <Line type="monotone" dataKey="opening" stroke="#8d99aa" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="current" stroke="#5cc8ff" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="fair" stroke="#b6e26a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
