import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  FileCheck,
  Trash2,
  Upload,
  AlertCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const GovernancePage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [erasureId, setErasureId] = useState('');
  const [erasureEmail, setErasureEmail] = useState('');
  const [erasureReason, setErasureReason] = useState('Data subject Article 17 request');
  const [isSubmittingErasure, setIsSubmittingErasure] = useState(false);
  const [erasureMessage, setErasureMessage] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getInspectionReport().then(setReport).catch(console.error);
    api.getAuditLogs().then(setAuditLogs).catch(console.error);
  }, []);

  const handleErasure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!erasureId || !erasureEmail) return;

    setIsSubmittingErasure(true);
    try {
      const res = await api.requestGDPRErasure(erasureId, erasureEmail, erasureReason);
      setErasureMessage(res.message);
      setErasureId('');
      setErasureEmail('');
      api.getAuditLogs().then(setAuditLogs);
    } catch (err: any) {
      alert(err.message || 'Erasure request failed');
    } finally {
      setIsSubmittingErasure(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const res = await api.uploadCSV(selectedFile);
      setUploadMessage(`Imported ${res.imported_records} records! (${res.duplicate_records} duplicates skipped)`);
      setSelectedFile(null);
      api.getAuditLogs().then(setAuditLogs);
    } catch (err: any) {
      alert(err.message || 'CSV upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
          Module 1, 9 & 10: Source Inspection & Compliance Governance
        </h2>
        <p className="text-xs text-slate-500">
          Enforces data access boundaries, EU GDPR compliance, source inspection directives, and complete administrative audit trails.
        </p>
      </div>

      {/* Source Inspection Matrix */}
      {report && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Source Technical Access & Authorization Matrix
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Target Platform</div>
              <div className="text-sm font-bold text-slate-900 mt-1">{report.target_url}</div>
              <div className="text-xs text-slate-600 mt-1">{report.platform_owner} ({report.cms})</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Rate Limit Safeguard</div>
              <div className="text-sm font-bold text-slate-900 mt-1">{report.robots_directives.rate_limit_recommended}</div>
              <div className="text-xs text-emerald-700 font-medium mt-1">Automatic Backoff Configured</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">GDPR Applicability</div>
              <div className="text-sm font-bold text-purple-900 mt-1">High (EU 2016/679)</div>
              <div className="text-xs text-slate-600 mt-1">Personal Data of Fitness Trainers</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Ingestion Channel</th>
                  <th className="py-2.5 px-4">Authorization Status</th>
                  <th className="py-2.5 px-4">Compliance Risk</th>
                  <th className="py-2.5 px-4">Throughput</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.available_channels.map((ch: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{ch.channel}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ch.status.includes('Fully Operational')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{ch.risk}</td>
                    <td className="py-3 px-4 font-mono font-medium">{ch.speed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CSV Ingestion & GDPR Erasure in 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved CSV Ingestion */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Phase 3: Approved Administrative CSV Ingestion
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ingest verified directory exports with automatic country standardization, date parsing, and link classification.
            </p>

            {uploadMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {uploadMessage}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <span className="text-[11px] text-slate-400 block mt-2">
                  Accepts UTF-8 / UTF-8-BOM encoded CSV files
                </span>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className="w-full py-2.5 px-4 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-sm"
              >
                {isUploading ? 'Ingesting and Normalizing...' : 'Upload & Process Approved CSV'}
              </button>
            </form>
          </div>
        </div>

        {/* GDPR Article 17 Erasure */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Module 10: GDPR Article 17 Right to Erasure
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Executes verifiable data subject deletion requests, cascading to qualifications and profiles while retaining immutable audit proof.
            </p>

            {erasureMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {erasureMessage}
              </div>
            )}

            <form onSubmit={handleErasure} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Target Member ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EREPS-142010"
                  value={erasureId}
                  onChange={(e) => setErasureId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Requestor Verified Email</label>
                <input
                  type="email"
                  required
                  placeholder="member@domain.com"
                  value={erasureEmail}
                  onChange={(e) => setErasureEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingErasure}
                className="w-full py-2.5 px-4 text-xs font-bold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 shadow-sm"
              >
                {isSubmittingErasure ? 'Processing Erasure...' : 'Execute GDPR Deletion'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Module 10: Administrative Audit History</span>
          </div>
          <span className="text-xs text-slate-500">{auditLogs.length} recent audit events</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-4">Timestamp</th>
              <th className="py-2.5 px-4">Operator</th>
              <th className="py-2.5 px-4">Action</th>
              <th className="py-2.5 px-4">Target Entity</th>
              <th className="py-2.5 px-4">Identifier</th>
              <th className="py-2.5 px-4">Details / Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px]">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-2.5 px-4 font-medium text-slate-700">{log.user_id || 'system'}</td>
                <td className="py-2.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-slate-600">{log.entity_type}</td>
                <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{log.entity_id}</td>
                <td className="py-2.5 px-4 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                  {log.changes ? JSON.stringify(log.changes) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
