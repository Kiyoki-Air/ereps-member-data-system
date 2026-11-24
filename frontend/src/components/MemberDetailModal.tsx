import React, { useState } from 'react';
import { Member } from '../types';
import { api } from '../services/api';
import {
  X,
  ExternalLink,
  Award,
  MapPin,
  Calendar,
  Building,
  Mail,
  Phone,
  Shield,
  Edit2,
  CheckCircle,
  Globe
} from 'lucide-react';

interface MemberDetailModalProps {
  member: Member | null;
  onClose: () => void;
  onUpdated: (updatedMember: Member) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  member,
  onClose,
  onUpdated
}) => {
  if (!member) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState('city');
  const [editValue, setEditValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editValue || !editReason) return;

    setIsSubmitting(true);
    try {
      const updated = await api.correctMember(member.member_id, editField, editValue, editReason);
      onUpdated(updated);
      setMessage(`Successfully updated ${editField}!`);
      setIsEditing(false);
      setEditValue('');
      setEditReason('');
    } catch (err: any) {
      alert(err.message || 'Correction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
                {member.member_id}
              </span>
              {member.master_trainer_status && (
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md border border-amber-200 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Master Trainer
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{member.full_name}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {member.city ? `${member.city}, ` : ''}{member.country || 'Unknown Location'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Valid through: {member.expiry_date || 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              Correct Record
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {message && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {message}
            </div>
          )}

          {/* Edit Form Drawer */}
          {isEditing && (
            <form onSubmit={handleCorrection} className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-3">
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Module 9: Manual Record Correction (Audited)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Target Field</label>
                  <select
                    value={editField}
                    onChange={(e) => setEditField(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="city">City</option>
                    <option value="country">Country</option>
                    <option value="professional_category">Professional Category</option>
                    <option value="expiry_date">Expiry Date (YYYY-MM-DD)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">New Value</label>
                  <input
                    type="text"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Enter corrected value"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Correction Reason (Required for Audit Trail)</label>
                <input
                  type="text"
                  required
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g., Verified against official national registry certificates"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </form>
          )}

          {/* Professional Bio */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Professional Biography & Scope</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              {member.profile?.description || 'No detailed biography provided on public listing.'}
            </div>
          </div>

          {/* Specialties */}
          {member.profile?.specialties && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Specialties & Core Focus</h3>
              <div className="flex flex-wrap gap-1.5">
                {member.profile.specialties.split(',').map((spec, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md border border-slate-200">
                    {spec.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications & EQF Levels */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Accredited Qualifications & EQF Levels
            </h3>
            <div className="space-y-2">
              {member.qualifications.length > 0 ? (
                member.qualifications.map((q) => (
                  <div key={q.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{q.qualification_name}</div>
                      <div className="text-[11px] text-slate-500">{q.awarding_body || 'Accredited Training Provider'}</div>
                    </div>
                    {q.eqf_level && (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {q.eqf_level}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic">Primary category: {member.professional_category}</div>
              )}
            </div>
          </div>

          {/* Business Information */}
          {(member.profile?.business_name || member.profile?.business_email || member.profile?.business_phone) && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Public Business Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {member.profile.business_name && (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span>{member.profile.business_name}</span>
                  </div>
                )}
                {member.profile.business_email && (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{member.profile.business_email}</span>
                  </div>
                )}
                {member.profile.business_phone && (
                  <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{member.profile.business_phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media & Websites */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Verified Social & Web Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {member.links.length > 0 ? (
                member.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.clean_url || link.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-blue-400 transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <div className="text-[10px] uppercase font-bold text-slate-500">{link.platform.replace('_', ' ')}</div>
                        <div className="text-xs text-blue-700 font-medium truncate group-hover:underline">
                          {link.clean_url}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </a>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic col-span-2">No external links attached to this profile.</div>
              )}
            </div>
          </div>

          {/* Provenance Footer */}
          <div className="p-3 bg-slate-100/70 rounded-lg text-[11px] text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Source Provenance:</span>
              <span className="font-medium text-slate-700">{member.source_provenance}</span>
            </div>
            <div className="flex justify-between">
              <span>Lawful Basis:</span>
              <span className="font-medium text-slate-700">{member.permission_basis}</span>
            </div>
            {member.profile_url && (
              <div className="flex justify-between items-center">
                <span>Original EREPS Profile:</span>
                <a
                  href={member.profile_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  View on ereps.eu <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
