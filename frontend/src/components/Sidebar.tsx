import React from 'react';
import {
  LayoutDashboard,
  Users,
  Share2,
  BarChart3,
  Cpu,
  DownloadCloud,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  totalMembers?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, totalMembers }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'members', label: 'Member Database', icon: Users, badge: totalMembers ? totalMembers.toLocaleString() : undefined },
    { id: 'social', label: 'Social & Websites', icon: Share2 },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'extraction', label: 'Extraction Manager', icon: Cpu },
    { id: 'export', label: 'Export Centre', icon: DownloadCloud },
    { id: 'governance', label: 'Governance & GDPR', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold shadow-sm">
            E
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">EREPS MANAGER</div>
            <div className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">Enterprise Data Hub</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Compliance / Status footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Compliance Enforced</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          GDPR (EU 2016/679) & robots.txt directives active. Throttled ethical access only.
        </p>
      </div>
    </aside>
  );
};
