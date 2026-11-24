import React from 'react';
import { RefreshCw, Database, Shield, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  isConnected: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  isConnected,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Dynamic Connection Indicator */}
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>FastAPI Engine Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-300 rounded-full text-xs font-semibold text-amber-800" title="Backend uvicorn server is not connected. Showing local cached dataset.">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Local Cached Mode</span>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {/* Operator Badge */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs flex items-center justify-center">
            AD
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-800">Admin Operator</div>
            <div className="text-[10px] text-slate-400">Full Access</div>
          </div>
        </div>
      </div>
    </header>
  );
};
