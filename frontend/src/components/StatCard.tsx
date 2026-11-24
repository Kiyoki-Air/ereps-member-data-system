import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  badge,
  badgeType = 'info'
}) => {
  const badgeClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  }[badgeType];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        {badge && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  );
};
