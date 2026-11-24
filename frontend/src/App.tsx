import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MemberDetailModal } from './components/MemberDetailModal';
import { OverviewPage } from './pages/OverviewPage';
import { MembersPage } from './pages/MembersPage';
import { SocialPage } from './pages/SocialPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ExtractionPage } from './pages/ExtractionPage';
import { ExportPage } from './pages/ExportPage';
import { GovernancePage } from './pages/GovernancePage';
import { AnalyticsResponse, Member } from './types';
import { api, isBackendConnected } from './services/api';
import { AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);

  const fetchAnalytics = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
      setConnected(isBackendConnected);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setConnected(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerJob = async (jobType: string) => {
    try {
      await api.createJob(jobType, 50, 30);
      setCurrentTab('extraction');
      fetchAnalytics();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger job');
    }
  };

  const getPageInfo = () => {
    switch (currentTab) {
      case 'overview':
        return { title: 'Executive Overview', subtitle: 'System health, KPIs, and directory status snapshot' };
      case 'members':
        return { title: 'Member Database', subtitle: 'Searchable European & International exercise professional registry' };
      case 'social':
        return { title: 'Social Media & Websites', subtitle: 'Classified direct URLs, verified handles, and personal domains' };
      case 'analytics':
        return { title: 'Analytics & Trends', subtitle: 'Geographic spread, qualifications, and data quality intelligence' };
      case 'extraction':
        return { title: 'Extraction Manager', subtitle: 'Background queue, checkpoint monitoring, and failure recovery' };
      case 'export':
        return { title: 'Export Centre', subtitle: 'OpenPyXL 5-sheet master workbook and modular CSV downloads' };
      case 'governance':
        return { title: 'Governance & GDPR', subtitle: 'Source inspection analysis, audit history, and erasure handling' };
      default:
        return { title: 'EREPS Hub', subtitle: 'Enterprise data management' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        totalMembers={analytics?.overview.total_members}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          isConnected={connected}
          onRefresh={fetchAnalytics}
          isRefreshing={isRefreshing}
        />

        {/* Offline notice banner if backend is not reachable */}
        {!connected && (
          <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Backend API is currently starting or offline.</strong> Displaying interactive local snapshot data. Start the server with: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold">python -m uvicorn backend.app.main:app --port 8000</code>
              </span>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded font-semibold text-[11px] text-amber-950 shrink-0 ml-4 transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}

        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'overview' && (
            <OverviewPage
              analytics={analytics}
              onNavigate={setCurrentTab}
              onTriggerJob={handleTriggerJob}
            />
          )}

          {currentTab === 'members' && (
            <MembersPage
              onSelectMember={setSelectedMember}
            />
          )}

          {currentTab === 'social' && (
            <SocialPage />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              analytics={analytics}
            />
          )}

          {currentTab === 'extraction' && (
            <ExtractionPage />
          )}

          {currentTab === 'export' && (
            <ExportPage />
          )}

          {currentTab === 'governance' && (
            <GovernancePage />
          )}
        </main>
      </div>

      {/* Individual Profile Drawer / Modal (Module 7C) */}
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onUpdated={(updated) => {
          setSelectedMember(updated);
          fetchAnalytics();
        }}
      />
    </div>
  );
};

export default App;
