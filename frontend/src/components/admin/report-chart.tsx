'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface ReportChartProps {
  type: 'bar' | 'line' | 'pie' | 'donut';
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export function ReportChart({ type, data, title, height = 250, showLegend = true, className }: ReportChartProps) {
  if (!data || data.length === 0) return <Card className={cn('p-6 text-center text-gray-400', className)}>No data available</Card>;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const colors = ['#570013', '#800020', '#C41E3A', '#E8707A', '#F4A3A8', '#D4A574', '#8B7355', '#6B5B45'];

  return (
    <Card className={cn('p-5', className)}>
      {title && <h3 className="font-semibold mb-4">{title}</h3>}

      {type === 'bar' && (
        <div className="flex items-end gap-2" style={{ height }}>
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-xs text-gray-500">{d.value}</span>
              <div className="w-full rounded-t transition-all hover:opacity-80" style={{ height: `${(d.value / maxVal) * 100}%`, backgroundColor: d.color || colors[i % colors.length], minHeight: 4 }} />
              <span className="text-xs text-gray-500 truncate w-full text-center">{d.label}</span>
            </div>
          ))}
        </div>
      )}

      {type === 'line' && (
        <svg viewBox={`0 0 ${data.length * 60} ${height}`} className="w-full" style={{ height }}>
          <polyline fill="none" stroke="#570013" strokeWidth="2" points={data.map((d, i) => `${i * 60 + 30},${height - (d.value / maxVal) * (height - 40) - 20}`).join(' ')} />
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={i * 60 + 30} cy={height - (d.value / maxVal) * (height - 40) - 20} r="4" fill="#570013" />
              <text x={i * 60 + 30} y={height - 5} textAnchor="middle" className="text-xs fill-gray-500">{d.label}</text>
              <text x={i * 60 + 30} y={height - (d.value / maxVal) * (height - 40) - 25} textAnchor="middle" className="text-xs fill-gray-700">{d.value}</text>
            </g>
          ))}
        </svg>
      )}

      {(type === 'pie' || type === 'donut') && (
        <div className="flex flex-col items-center gap-4">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {(() => {
              const total = data.reduce((s, d) => s + d.value, 0);
              let cumAngle = -90;
              const cx = 100, cy = 100, r = type === 'donut' ? 80 : 90;
              return data.map((d, i) => {
                const angle = (d.value / total) * 360;
                const startAngle = cumAngle;
                cumAngle += angle;
                if (angle === 0) return null;
                const sr = (startAngle * Math.PI) / 180, er = ((startAngle + angle) * Math.PI) / 180;
                const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
                const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
                const large = angle > 180 ? 1 : 0;
                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                return <path key={i} d={path} fill={d.color || colors[i % colors.length]} />;
              });
            })()}
            {type === 'donut' && <circle cx="100" cy="100" r="50" fill="white" />}
          </svg>
          {showLegend && (
            <div className="flex flex-wrap gap-3 justify-center">
              {data.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color || colors[i % colors.length] }} />
                  <span>{d.label}</span>
                  <span className="text-gray-500">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
