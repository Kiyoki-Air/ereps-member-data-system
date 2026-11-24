import React, { useState, useEffect } from 'react';
import { Member, MemberListResponse } from '../types';
import { api } from '../services/api';
import {
  Search,
  Filter,
  Award,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Share2,
  RefreshCw
} from 'lucide-react';

interface MembersPageProps {
  onSelectMember: (member: Member) => void;
}

export const MembersPage: React.FC<MembersPageProps> = ({ onSelectMember }) => {
  const [data, setData] = useState<MemberListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [qualification, setQualification] = useState('');
  const [masterTrainerOnly, setMasterTrainerOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDesc, setSortDesc] = useState(true);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMembers({
        search: search.trim() || undefined,
        country: country || undefined,
        qualification: qualification || undefined,
        master_trainer_only: masterTrainerOnly || undefined,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_desc: sortDesc
      });
      setData(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [page, country, qualification, masterTrainerOnly, sortBy, sortDesc]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const countries = [
    "Germany", "United Kingdom", "France", "Spain", "Italy", "Netherlands",
    "Belgium", "Portugal", "Sweden", "Ireland", "Greece", "Austria", "Switzerland"
  ];

  const qualifications = [
    "Personal Trainer",
    "Group Fitness Instructor",
    "Graduate Exercise Professional",
    "Pilates Teacher - Matwork",
    "Exercise for Health Specialist",
    "Youth Fitness Specialist"
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by full name, member ID (#133197), city, or country..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Country Dropdown */}
            <select
              value={country}
              onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 bg-white"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Qualification Dropdown */}
            <select
              value={qualification}
              onChange={(e) => { setQualification(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 bg-white"
            >
              <option value="">All Qualifications</option>
              {qualifications.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>

            {/* Master Trainer Toggle */}
            <button
              type="button"
              onClick={() => { setMasterTrainerOnly(!masterTrainerOnly); setPage(1); }}
              className={`px-3 py-1 rounded-md font-medium border flex items-center gap-1.5 transition-colors ${
                masterTrainerOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Master Trainers Only
            </button>
          </div>

          <div className="text-slate-500">
            {data ? `Showing ${data.items.length} of ${data.total.toLocaleString()} members` : 'Loading...'}
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Member ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Primary Category</th>
                <th className="py-3 px-4">Master Trainer</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Verified Links</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading members...
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((m) => {
                  const hasWeb = m.links.some(l => l.link_type === 'website');
                  const hasSocial = m.links.some(l => l.link_type === 'social');
                  return (
                    <tr
                      key={m.member_id}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => onSelectMember(m)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {m.member_id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-700">
                        {m.full_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {m.city ? `${m.city}, ` : ''}{m.country || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium border border-slate-200">
                          {m.professional_category || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {m.master_trainer_status ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200 text-[10px]">
                            <Award className="w-3 h-3 text-amber-600" />
                            YES
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">NO</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {m.expiry_date || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {hasWeb && (
                            <span title="Website Available" className="p-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <Globe className="w-3 h-3" />
                            </span>
                          )}
                          {hasSocial && (
                            <span title="Social Media Available" className="p-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                              <Share2 className="w-3 h-3" />
                            </span>
                          )}
                          {!hasWeb && !hasSocial && (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectMember(m)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 inline-flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-blue-600" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No member records found matching current query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.total_pages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <div className="text-slate-500">
              Page {data.page} of {data.total_pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
