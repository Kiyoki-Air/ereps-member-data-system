import React from 'react';
import { AnalyticsResponse } from '../types';
import {
  BarChart2,
  PieChart,
  Activity,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';

interface AnalyticsPageProps {
  analytics: AnalyticsResponse | null;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ analytics }) => {
  if (!analytics) {
    return <div className="text-center py-12 text-slate-500">Loading analytics...</div>;
  }

  const {
    overview,
    country_distribution,
    qualification_distribution,
    platform_distribution,
    missing_fields_stats,
    performance_metrics
  } = analytics;

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
          Module 7E: Analytics, Completeness & Quality Intelligence
        </h2>
        <p className="text-xs text-slate-500">
          Provides multi-dimensional intelligence across geographic coverage, vocational disciplines, and data completeness metrics.
        </p>
      </div>

      {/* Grid of Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Country Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Geographic Distribution (Top Countries)
            </h3>
          </div>
          <div className="space-y-3">
            {country_distribution.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(item.percentage * 2.5, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Vocational & Qualification Disciplines
            </h3>
          </div>
          <div className="space-y-3">
            {qualification_distribution.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">{item.label}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(item.percentage * 2.5, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Platforms & Quality Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Media Platform Share */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Social Media & Web Platform Adoption
            </h3>
          </div>
          <div className="space-y-3">
            {platform_distribution.map((p, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{p.label}</span>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-white rounded border border-slate-200">
                  {p.count.toLocaleString()} links ({p.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Quality & Missing Fields */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Module 9: Missing Field & Completeness Audit
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 mb-1">Missing City Info</div>
                <div className="text-base font-bold text-slate-900">{missing_fields_stats.missing_city || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 mb-1">Missing Expiry Date</div>
                <div className="text-base font-bold text-slate-900">{missing_fields_stats.missing_expiry || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 mb-1">Pending Stage 2 Profiles</div>
                <div className="text-base font-bold text-amber-700">{missing_fields_stats.pending_profiles || 0}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-slate-500 mb-1">Missing Bio / Description</div>
                <div className="text-base font-bold text-slate-900">{missing_fields_stats.missing_bio || 0}</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
            <span className="font-semibold">Query Latency Index:</span>
            <span className="font-mono font-bold">{performance_metrics.db_query_time_ms} ms (Indexed)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
