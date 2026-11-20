import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalculationResult } from '../types';

type ChartModel = NonNullable<CalculationResult['chart']>;

export const ResultChart: React.FC<{ chart: ChartModel }> = ({ chart }) => {
  const data = chart.points.map((point) => ({
    name: String(point.x),
    value: point.y,
    secondary: point.secondary,
  }));
  const hasSecondary = data.some((row) => row.secondary !== undefined);
  const compact = data.length <= 4;

  return (
    <div className="h-64 w-full" role="img" aria-label={chart.title}>
      <ResponsiveContainer width="100%" height="100%">
        {compact ? (
          <BarChart data={data}>
            <CartesianGrid stroke="#EAE7E2" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#182338' }} />
            <YAxis tick={{ fontSize: 11, fill: '#788190' }} />
            <Tooltip />
            <Bar dataKey="value" name={chart.yLabel} fill="#F47B35" radius={[6, 6, 0, 0]} />
            {hasSecondary && <Bar dataKey="secondary" name="Comparison" fill="#182338" radius={[6, 6, 0, 0]} />}
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid stroke="#EAE7E2" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#182338' }} />
            <YAxis tick={{ fontSize: 11, fill: '#788190' }} />
            <Tooltip />
            {hasSecondary && <Legend />}
            <Line type="monotone" dataKey="value" name={chart.yLabel} stroke="#F47B35" strokeWidth={2.4} dot={false} />
            {hasSecondary && (
              <Line type="monotone" dataKey="secondary" name="Comparison" stroke="#182338" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
