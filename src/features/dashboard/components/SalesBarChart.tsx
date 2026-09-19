import React, { useState } from 'react';
import { formatRupiah } from '@/utils/currency';
import type { SalesChartPoint } from '../types/dashboard';

export interface SalesBarChartProps {
  data: SalesChartPoint[];
  isLoading?: boolean;
}

export const SalesBarChart: React.FC<SalesBarChartProps> = ({ data, isLoading }) => {
  const [hoveredPoint, setHoveredPoint] = useState<SalesChartPoint | null>(null);

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-xs">
        <p>Tidak ada data tren penjualan untuk periode ini.</p>
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.total_sales), 100000);

  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tooltip display bar */}
      <div className="h-7 flex items-center justify-between text-xs px-1">
        {hoveredPoint ? (
          <div className="flex items-center gap-3 animate-fadeIn">
            <span className="font-semibold text-stone-900">
              {hoveredPoint.date}
            </span>
            <span className="text-amber-800 font-bold font-mono">
              {formatRupiah(hoveredPoint.total_sales)}
            </span>
            <span className="text-stone-500">
              ({hoveredPoint.total_orders} transaksi)
            </span>
          </div>
        ) : (
          <span className="text-stone-400 italic text-[11px]">
            Arahkan kursor pada bar untuk melihat rincian omset harian
          </span>
        )}
      </div>

      {/* Bars Chart Area */}
      <div className="h-56 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-stone-200">
        {data.map((point) => {
          const heightPercent = Math.max(
            point.total_sales > 0 ? (point.total_sales / maxSales) * 100 : 4,
            4
          );
          const isHovered = hoveredPoint?.date === point.date;

          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Bar */}
              <div className="w-full max-w-[40px] flex items-end justify-center h-full">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-md transition-all duration-200 ${
                    isHovered
                      ? 'bg-amber-600 shadow-md'
                      : point.total_sales > 0
                      ? 'bg-amber-400 group-hover:bg-amber-500'
                      : 'bg-stone-200'
                  }`}
                />
              </div>

              {/* Date Label */}
              <span className="text-[11px] font-mono text-stone-500 mt-2 whitespace-nowrap">
                {formatDateLabel(point.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
