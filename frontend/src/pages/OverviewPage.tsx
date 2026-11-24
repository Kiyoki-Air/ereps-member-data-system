import React from 'react';
import { AnalyticsResponse } from '../types';
import { StatCard } from '../components/StatCard';
import {
  Users,
  FileCheck,
  Clock,
  Globe,
  Share2,
  AlertTriangle,
  Copy,
  Percent,
  TrendingUp,
  Download,
  PlayCircle,
  Database
} from 'lucide-react';

interface OverviewPageProps {
  analytics: AnalyticsResponse | null;
  onNavigate: (tab: string) => void;
  onTriggerJob: (jobType: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  analytics,
  onNavigate,
  onTriggerJob
}) => {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Loading system analytics...
      </div>
    );
  }

  const { overview, country_distribution, qualification_distribution, performance_metrics } = analytics;

  return (
    <div className="space-y-8">
      {/* KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Directory Extraction Health & KPIs
          </h2>
          <span className="text-xs text-slate-500">
            Real-time PostgreSQL Relational Aggregations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={overview.total_members.toLocaleString()}
            subtext="Unique validated records"
            icon={Users}
            badge="Live DB"
            badgeType="info"
          />
          <StatCard
            title="Profiles Extracted"
            value={overview.profiles_processed.toLocaleString()}
            subtext="Deep biographical records"
            icon={FileCheck}
            badge="Stage 2 Done"
            badgeType="success"
          />
          <StatCard
            title="Pending Profiles"
            value={overview.pending_profiles.toLocaleString()}
            subtext="Awaiting secondary pass"
            icon={Clock}
            badge="In Queue"
            badgeType={overview.pending_profiles > 0 ? "warning" : "info"}
          />
          <StatCard
            title="Extraction Success"
            value={`${overview.success_percentage}%`}
            subtext="Overall transaction health"
            icon={Percent}
            badge="Nominal"
            badgeType="success"
          />
          <StatCard
            title="Members With Websites"
            value={overview.members_with_websites.toLocaleString()}
            subtext="Personal & business domains"
            icon={Globe}
            badge="Verified"
            badgeType="info"
          />
          <StatCard
            title="Members With Social"
            value={overview.members_with_social.toLocaleString()}
            subtext="Instagram, LinkedIn, FB, etc."
            icon={Share2}
            badge="8 Platforms"
            badgeType="info"
          />
          <StatCard
            title="Failed Records"
            value={overview.failed_records.toLocaleString()}
            subtext="Tracked for auto-retry"
            icon={AlertTriangle}
            badge={overview.failed_records > 0 ? "Action Req." : "Clean"}
            badgeType={overview.failed_records > 0 ? "danger" : "success"}
          />
          <StatCard
            title="Duplicate Records"
            value={overview.duplicate_records.toLocaleString()}
            subtext="Prevented & de-duplicated"
            icon={Copy}
            badge="Deduplicated"
            badgeType="info"
          />
        </div>
      </div>

      {/* Quick Launch & Extraction Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
          Operations & Milestone Workflows
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Execute authorized live extraction cycles, monitor authentic member directories across 86 countries, or generate the official 5-sheet OpenPyXL Excel report.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase mb-1">
                <PlayCircle className="w-4 h-4 text-blue-600" />
                Live Verification Run
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1">Live EREPS Directory Extraction</div>
              <p className="text-xs text-slate-600 mb-4">
                Polls all 348 live directory pages directly from ereps.eu and ingests all real certified exercise professionals.
              </p>
            </div>
            <button
              onClick={() => onNavigate('extraction')}
              className="w-full py-2 px-3 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
            >
              Open Extraction Manager
            </button>
          </div>

          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase mb-1">
                <Download className="w-4 h-4 text-emerald-600" />
                Module 8 Export Centre
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1">Download 5-Sheet Excel Workbook</div>
              <p className="text-xs text-slate-600 mb-4">
                OpenPyXL styled workbook with All 16,600 Real Members, Profiles, Genuine Social Media Links, Websites, and Logs.
              </p>
            </div>
            <button
              onClick={() => onNavigate('export')}
              className="w-full py-2 px-3 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 shadow-sm transition-all"
            >
              Go to Export Centre
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Countries Distribution</h4>
            <button onClick={() => onNavigate('analytics')} className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {country_distribution.slice(0, 5).map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.count.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(item.percentage * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Disciplines Snapshot */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Professional Qualifications</h4>
            <button onClick={() => onNavigate('members')} className="text-xs font-semibold text-blue-600 hover:underline">
              Filter Members
            </button>
          </div>
          <div className="space-y-3">
            {qualification_distribution.slice(0, 5).map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.count.toLocaleString()} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${Math.min(item.percentage * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
