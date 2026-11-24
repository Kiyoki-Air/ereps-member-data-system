export interface Qualification {
  id: number;
  member_id: string;
  qualification_name: string;
  eqf_level?: string;
  discipline?: string;
  awarding_body?: string;
  expiry_date?: string;
  is_master_trainer: boolean;
  created_at: string;
}

export interface MemberProfile {
  id: number;
  member_id: string;
  description?: string;
  specialties?: string;
  certifications_text?: string;
  business_name?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  original_profile_url?: string;
  source_status: string;
  missing_fields?: string;
  extraction_date: string;
}

export interface MemberLink {
  id: number;
  member_id: string;
  platform: string;
  original_url: string;
  clean_url: string;
  link_type: string;
  is_verified: boolean;
  last_checked: string;
  source_profile_url?: string;
}

export interface MemberLinkPagedResponse {
  items: MemberLink[];
  total: number;
  total_members_with_links: number;
  total_social_links: number;
  total_website_links: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Member {
  member_id: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  city?: string;
  country?: string;
  raw_country?: string;
  professional_category?: string;
  master_trainer_status: boolean;
  expiry_date?: string;
  profile_url?: string;
  source_provenance: string;
  permission_basis: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  qualifications: Qualification[];
  profile?: MemberProfile;
  links: MemberLink[];
}

export interface MemberListResponse {
  items: Member[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface OverviewStats {
  total_members: number;
  profiles_processed: number;
  pending_profiles: number;
  members_with_websites: number;
  members_with_social: number;
  failed_records: number;
  duplicate_records: number;
  success_percentage: number;
  total_qualifications: number;
  total_links: number;
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsResponse {
  overview: OverviewStats;
  country_distribution: DistributionItem[];
  qualification_distribution: DistributionItem[];
  platform_distribution: DistributionItem[];
  missing_fields_stats: Record<string, number>;
  performance_metrics: Record<string, any>;
}

export interface ExtractionJob {
  id: string;
  job_name: string;
  job_type: string;
  status: string;
  total_records: number;
  processed_records: number;
  successful_records: number;
  failed_records: number;
  duplicate_records: number;
  current_page: number;
  rate_limit_per_min: number;
  batch_size: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface ExtractionLog {
  id: number;
  job_id: string;
  member_id?: string;
  log_level: string;
  message: string;
  error_details?: string;
  timestamp: string;
}

export interface FailedRecord {
  id: number;
  job_id: string;
  member_id?: string;
  record_identifier: string;
  stage: string;
  error_reason: string;
  retry_count: number;
  status: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}
