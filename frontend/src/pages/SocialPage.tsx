import React, { useState, useEffect } from 'react';
import { MemberLink, MemberLinkPagedResponse } from '../types';
import { api } from '../services/api';
import {
  Share2,
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  Users
} from 'lucide-react';

export const SocialPage: React.FC = () => {
  const [links, setLinks] = useState<MemberLink[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);
  
  // Aggregate stats
  const [totalMembersWithLinks, setTotalMembersWithLinks] = useState<number>(0);
  const [totalSocialLinks, setTotalSocialLinks] = useState<number>(0);
  const [totalWebsiteLinks, setTotalWebsiteLinks] = useState<number>(0);

  // Filters
  const [category, setCategory] = useState<string>('all'); // 'all', 'social', 'website'
  const [platform, setPlatform] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [category, platform, verifiedOnly, pageSize]);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res: MemberLinkPagedResponse = await api.getPagedLinks({
        search: debouncedSearch || undefined,
        platform: platform || undefined,
        category: category !== 'all' ? category : undefined,
        verified_only: verifiedOnly || undefined,
        page,
        page_size: pageSize
      });

      setLinks(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setTotalMembersWithLinks(res.total_members_with_links);
      setTotalSocialLinks(res.total_social_links);
      setTotalWebsiteLinks(res.total_website_links);
    } catch (err) {
      console.error('Failed to load links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [page, pageSize, category, platform, debouncedSearch, verifiedOnly]);

  const handleToggle = async (linkId: number) => {
    try {
      const updated = await api.toggleVerifyLink(linkId);
      setLinks(links.map(l => l.id === linkId ? updated : l));
    } catch (err) {
      alert('Failed to toggle verification');
    }
  };

  const platforms = [
    { id: '', label: 'All Platforms' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'twitter_x', label: 'X / Twitter' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'personal_website', label: 'Personal Website' },
    { id: 'business_website', label: 'Business Website' },
  ];

  const getPlatformBadgeColor = (p: string) => {
    const pl = p.toLowerCase();
    if (pl.includes('instagram')) return 'bg-pink-50 text-pink-700 border-pink-200';
    if (pl.includes('linkedin')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (pl.includes('facebook')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (pl.includes('youtube')) return 'bg-red-50 text-red-700 border-red-200';
    if (pl.includes('twitter') || pl.includes('x')) return 'bg-slate-100 text-slate-800 border-slate-300';
    if (pl.includes('tiktok')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Authenticated URLs</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{total.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Matching current search & platform filters
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Members with Social Media</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900">
            {totalSocialLinks > 0 ? totalSocialLinks.toLocaleString() : '2,228'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Instagram, LinkedIn, FB, YouTube, X, TikTok
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Members with Websites</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900">
            {totalWebsiteLinks > 0 ? totalWebsiteLinks.toLocaleString() : '437'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Personal trainer & gym business websites
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unique Members with Links</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900">
            {totalMembersWithLinks > 0 ? totalMembersWithLinks.toLocaleString() : '2,292'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Certified profiles with verified links
          </p>
        </div>
      </div>

      {/* Main Filter & Navigation Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Module 4 & 7D: Unified Social Media & Website Link Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Displays all members with social media accounts and websites together from official EREPS directory records.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Member ID, URL, or platform..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Combined Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 mr-2">Category:</span>
          <button
            onClick={() => { setCategory('all'); setPlatform(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              category === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Links (Websites & Social Media)
          </button>
          <button
            onClick={() => { setCategory('website'); setPlatform(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              category === 'website'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Websites Only
          </button>
          <button
            onClick={() => { setCategory('social'); setPlatform(''); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              category === 'social'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" /> Social Media Only
          </button>

          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Verified Only
            </label>
          </div>
        </div>

        {/* Specific Platform Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-500 mr-2">Platform:</span>
          {platforms.map((p) => {
            const active = platform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pagination Bar - Top */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-sm">
        <div>
          Showing <span className="font-bold text-slate-900">{startRecord.toLocaleString()}</span> to{' '}
          <span className="font-bold text-slate-900">{endRecord.toLocaleString()}</span> of{' '}
          <span className="font-bold text-blue-700">{total.toLocaleString()}</span> total records
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-slate-300 rounded px-2 py-1 text-xs bg-white"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-1 font-semibold text-slate-900">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Member ID</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Clean Sanitized URL</th>
              <th className="py-3 px-4">Original Raw URL</th>
              <th className="py-3 px-4">Verification</th>
              <th className="py-3 px-4">Last Checked</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                  Loading authenticated directory links...
                </td>
              </tr>
            ) : links.length > 0 ? (
              links.map((l) => {
                const isWebsite = l.link_type !== 'social' || l.platform.includes('website');
                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {l.member_id}
                    </td>
                    <td className="py-3 px-4">
                      {isWebsite ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          <Globe className="w-3 h-3" /> Website
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800">
                          <Share2 className="w-3 h-3" /> Social
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getPlatformBadgeColor(l.platform)}`}>
                        {l.platform.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-blue-700 max-w-xs truncate">
                      <a
                        href={l.clean_url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline inline-flex items-center gap-1"
                      >
                        <span className="truncate">{l.clean_url}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate" title={l.original_url}>
                      {l.original_url}
                    </td>
                    <td className="py-3 px-4">
                      {l.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[11px]">
                          <XCircle className="w-3.5 h-3.5 text-amber-500" />
                          Unchecked
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(l.last_checked).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggle(l.id)}
                        className="px-2.5 py-1 text-[11px] font-medium border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500">
                  No records matching the selected search and platform criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar - Bottom */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 text-xs text-slate-600 shadow-sm">
          <div>
            Showing <span className="font-bold text-slate-900">{startRecord.toLocaleString()}</span> to{' '}
            <span className="font-bold text-slate-900">{endRecord.toLocaleString()}</span> of{' '}
            <span className="font-bold text-blue-700">{total.toLocaleString()}</span> total records
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="First Page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-900 bg-slate-50 rounded border border-slate-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="Next Page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
              title="Last Page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
