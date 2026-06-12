import React from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

// Recharts' PolarAngleAxis types expect TickItem objects, but it accepts raw numbers at runtime.
const RADAR_TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as any;

const formatPolarAngle = (val: number) => {
  if (val === 0) return '0° (X)';
  if (val === 90) return '90° (Y)';
  return `${val}°`;
};

interface PolarimetryPlotProps {
  title: React.ReactNode;
  subtitle: string;
  data: { angle: number; [key: string]: number }[];
  domainMax: number;
  dataKey: string;
  radarName: string;
  displayMax: number;
  labelPrefix: 'Polarizer' | 'Analyzer';
}

export function PolarimetryPlot({
  title,
  subtitle,
  data,
  domainMax,
  dataKey,
  radarName,
  displayMax,
  labelPrefix
}: PolarimetryPlotProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h3 className="text-lg font-serif italic text-center">{title}</h3>
      <div className="text-[10px] uppercase tracking-widest opacity-50">{subtitle}</div>
      <div className="w-full aspect-square max-w-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid gridType="circle" stroke="#141414" strokeOpacity={0.1} />
            <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} ticks={RADAR_TICKS} tickFormatter={formatPolarAngle} stroke="#141414" strokeOpacity={0.5} tick={{ fontSize: 10 }} axisLineType="circle" />
            <PolarRadiusAxis angle={90} domain={[0, Math.max(1e-6, domainMax) / 0.95]} tick={false} axisLine={false} />
            <Radar name={radarName} dataKey={dataKey} stroke="#141414" strokeWidth={2} fill="#141414" fillOpacity={0.1} isAnimationActive={false} />
            <Tooltip
              formatter={(value) => (typeof value === 'number' ? value.toFixed(4) : value)}
              labelFormatter={(label) => `${labelPrefix} Angle: ${label}°`}
              contentStyle={{ backgroundColor: '#E4E3E0', border: '1px solid #141414', borderRadius: '0px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] font-mono opacity-50">Max: {displayMax.toFixed(4)}</div>
    </div>
  );
}
