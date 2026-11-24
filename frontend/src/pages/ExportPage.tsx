import React, { useState } from 'react';
import { api } from '../services/api';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Layers,
  ExternalLink
} from 'lucide-react';

export const ExportPage: React.FC = () => {
  const [country, setCountry] = useState('');
  const [qualification, setQualification] = useState('');

  const countries = [
    "Germany", "United Kingdom", "France", "Spain", "Italy", "Netherlands",
    "Belgium", "Portugal", "Sweden", "Ireland", "Greece", "Austria", "Switzerland"
  ];

  const qualifications = [
    "Personal Trainer",
    "Group Fitness Instructor",
    "Graduate Exercise Professional",
    "Pilates Teacher - Matwork",
    "Exercise for Health Specialist"
  ];

  const handleExcelDownload = () => {
    const url = api.getExcelExportUrl(country || undefined, qualification || undefined);
    window.open(url, '_blank');
  };

  const handleCSVDownload = (type: string) => {
    const url = api.getCSVExportUrl(type);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
          Module 8: Dedicated Excel & CSV Export Centre
        </h2>
        <p className="text-xs text-slate-500">
          Export fully-formatted enterprise multi-sheet Excel workbooks generated with OpenPyXL, plus targeted CSV extracts.
        </p>
      </div>

      {/* Main 5-Sheet Excel Card */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-2xl p-8 text-white shadow-lg border border-blue-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-700">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Master 5-Sheet OpenPyXL Workbook
          </div>
          <h3 className="text-2xl font-bold mb-2">Generate Complete EREPS Master Workbook</h3>
          <p className="text-xs text-blue-200 leading-relaxed mb-6">
            Compiles a unified, professionally-styled multi-sheet Excel file adhering strictly to Module 8 specification:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-8">
            <div className="p-3 rounded-lg bg-blue-900/60 border border-blue-800/80 flex items-start gap-2.5">
              <span className="font-mono font-bold text-blue-300">#1</span>
              <div>
                <strong className="block text-white">ALL MEMBERS</strong>
                <span className="text-blue-300 text-[11px]">ID, names, city, country, expiry, URLs</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-900/60 border border-blue-800/80 flex items-start gap-2.5">
              <span className="font-mono font-bold text-blue-300">#2</span>
              <div>
                <strong className="block text-white">MEMBER PROFILES</strong>
                <span className="text-blue-300 text-[11px]">Bios, specialties, certifications, business info</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-900/60 border border-blue-800/80 flex items-start gap-2.5">
              <span className="font-mono font-bold text-blue-300">#3</span>
              <div>
                <strong className="block text-white">SOCIAL MEDIA LINKS</strong>
                <span className="text-blue-300 text-[11px]">Instagram, LinkedIn, FB, YouTube, TikTok</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-900/60 border border-blue-800/80 flex items-start gap-2.5">
              <span className="font-mono font-bold text-blue-300">#4</span>
              <div>
                <strong className="block text-white">WEBSITES</strong>
                <span className="text-blue-300 text-[11px]">Personal & business domains, verified status</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-900/60 border border-blue-800/80 flex items-start gap-2.5 sm:col-span-2">
              <span className="font-mono font-bold text-blue-300">#5</span>
              <div>
                <strong className="block text-white">EXTRACTION LOGS</strong>
                <span className="text-blue-300 text-[11px]">Execution status, extraction dates, error traces</span>
              </div>
            </div>
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-3 bg-blue-900/40 p-4 rounded-xl border border-blue-800 mb-6 text-xs">
            <span className="text-blue-200 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Optional Scope:
            </span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="bg-blue-950 text-white border border-blue-700 rounded-md px-3 py-1.5 focus:outline-none"
            >
              <option value="">All Countries (Entire DB)</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="bg-blue-950 text-white border border-blue-700 rounded-md px-3 py-1.5 focus:outline-none"
            >
              <option value="">All Qualifications</option>
              {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <button
            onClick={handleExcelDownload}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" /> Download 5-Sheet Excel Workbook (.xlsx)
          </button>
        </div>
      </div>

      {/* CSV Exports Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
          Individual CSV Modular Exports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-blue-600 mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Members Base CSV</h4>
              <p className="text-xs text-slate-500 mb-4">
                Raw comma-separated table of all members, contact locations, qualifications, and registration validity.
              </p>
            </div>
            <button
              onClick={() => handleCSVDownload('members')}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Members CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-purple-600 mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Social & Web Links CSV</h4>
              <p className="text-xs text-slate-500 mb-4">
                Structured export of sanitized profile URLs, platform classifications, and verification status.
              </p>
            </div>
            <button
              onClick={() => handleCSVDownload('links')}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Links CSV
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-rose-600 mb-2">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Failed Records Audit CSV</h4>
              <p className="text-xs text-slate-500 mb-4">
                Full dump of quarantined records, failure reasons, and retry attempt histories.
              </p>
            </div>
            <button
              onClick={() => handleCSVDownload('failed')}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download Failures CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
