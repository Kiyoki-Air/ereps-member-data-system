import React, { useState, useEffect } from 'react';
import { ExtractionJob, ExtractionLog, FailedRecord } from '../types';
import { api } from '../services/api';
import {
  Play,
  Pause,
  RotateCcw,
  AlertOctagon,
  FileText,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Terminal,
  ShieldAlert
} from 'lucide-react';

export const ExtractionPage: React.FC = () => {
  const [jobs, setJobs] = useState<ExtractionJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ExtractionLog[]>([]);
  const [failures, setFailures] = useState<FailedRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [batchSize, setBatchSize] = useState<number>(50);
  const [rateLimit, setRateLimit] = useState<number>(30);
  const [authToken, setAuthToken] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const jobList = await api.getJobs();
      setJobs(jobList);
      if (jobList.length > 0 && !selectedJobId) {
        setSelectedJobId(jobList[0].id);
      }
      const failureList = await api.getFailures();
      setFailures(failureList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      api.getJobLogs(selectedJobId).then(setLogs).catch(console.error);
    }
  }, [selectedJobId]);

  const handleStartJob = async (type: string) => {
    try {
      const job = await api.createJob(type, batchSize, rateLimit, authToken || undefined);
      setSelectedJobId(job.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to start job');
    }
  };

  const handlePause = async (id: string) => {
    await api.pauseJob(id);
    loadData();
  };

  const handleResume = async (id: string) => {
    await api.resumeJob(id);
    loadData();
  };

  const handleRetryFailures = async (jobId: string) => {
    setIsRetrying(true);
    try {
      const res = await api.retryJobFailures(jobId);
      alert(`Retried ${res.retried} records. Resolved: ${res.resolved}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Retry failed');
    } finally {
      setIsRetrying(false);
    }
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  return (
    <div className="space-y-6">
      {/* Engine Controls & Parameters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Module 6 & 7F: Background Extraction Engine Manager
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manages background queues, batch checkpoints, rate limits, and failure retry pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleStartJob('live_directory')}
              className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Start Live Directory Extraction
            </button>
          </div>
        </div>

        {/* Configuration settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Batch Size (Records per chunk)</label>
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2"
              min={10}
              max={5000}
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Permitted Request Rate (Req / min)</label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2"
              min={5}
              max={120}
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Authorization Token (For Live Run)</label>
            <input
              type="password"
              placeholder="Optional API token (defaults to authorized public session)"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>
        </div>
      </div>

      {/* Active Job Card & Progress Bar */}
      {selectedJob && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700">{selectedJob.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  selectedJob.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedJob.status === 'running'
                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                    : selectedJob.status === 'paused'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedJob.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedJob.job_name}</h3>
            </div>

            <div className="flex items-center gap-2">
              {selectedJob.status === 'running' && (
                <button
                  onClick={() => handlePause(selectedJob.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause Job
                </button>
              )}
              {selectedJob.status === 'paused' && (
                <button
                  onClick={() => handleResume(selectedJob.id)}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" /> Resume Job
                </button>
              )}
              {selectedJob.failed_records > 0 && (
                <button
                  onClick={() => handleRetryFailures(selectedJob.id)}
                  disabled={isRetrying}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry Failed ({selectedJob.failed_records})
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>
                Processed: <strong className="text-slate-900">{selectedJob.processed_records}</strong> / {selectedJob.total_records} records
              </span>
              <span>
                {selectedJob.total_records > 0
                  ? Math.round((selectedJob.processed_records / selectedJob.total_records) * 100)
                  : 100}% Completed
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  selectedJob.status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                style={{
                  width: `${selectedJob.total_records > 0 ? (selectedJob.processed_records / selectedJob.total_records) * 100 : 100}%`
                }}
              ></div>
            </div>

            <div className="flex gap-4 text-xs pt-2 text-slate-500 font-mono">
              <span>Successful: <strong className="text-emerald-700">{selectedJob.successful_records}</strong></span>
              <span>Failed: <strong className="text-rose-700">{selectedJob.failed_records}</strong></span>
              <span>Duplicates: <strong className="text-amber-700">{selectedJob.duplicate_records}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Two Columns: Recent Jobs & Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs List */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Extraction History (Recent Jobs)
          </h3>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {jobs.map((j) => (
              <div
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs ${
                  j.id === selectedJobId ? 'bg-blue-50/70 border border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-900">{j.job_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {j.id} • {new Date(j.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    j.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {j.status}
                  </span>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {j.successful_records} recs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Logs Terminal */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 shadow-sm text-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-emerald-400">
              <Terminal className="w-4 h-4" />
              <span>LIVE EXTRACTION EXECUTION LOGS</span>
            </div>
            <div className="font-mono text-[11px] space-y-1.5 max-h-72 overflow-y-auto pr-2 text-slate-300">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="leading-relaxed">
                    <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className={`font-bold ${
                      log.log_level === 'SUCCESS' ? 'text-emerald-400' :
                      log.log_level === 'ERROR' ? 'text-rose-400' :
                      log.log_level === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      [{log.log_level}]
                    </span>{' '}
                    <span>{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic py-4">No recent logs recorded for this task.</div>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono pt-3 border-t border-slate-800 mt-3">
            Transaction safety: Active • SQLite / PostgreSQL Engine
          </div>
        </div>
      </div>

      {/* Failed Records Table */}
      {failures.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Failed Records Quarantine (Module 6 Requirement)</span>
            </div>
            <span className="text-xs text-rose-700 font-semibold">{failures.length} records pending resolution</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Identifier</th>
                <th className="py-2.5 px-4">Stage</th>
                <th className="py-2.5 px-4">Failure Reason</th>
                <th className="py-2.5 px-4">Retries</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {failures.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{f.record_identifier}</td>
                  <td className="py-2.5 px-4 uppercase text-[10px] font-semibold text-slate-600">{f.stage}</td>
                  <td className="py-2.5 px-4 text-rose-700 font-medium">{f.error_reason}</td>
                  <td className="py-2.5 px-4 font-mono">{f.retry_count}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
