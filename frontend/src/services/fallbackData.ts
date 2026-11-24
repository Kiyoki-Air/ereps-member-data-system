import { AnalyticsResponse, Member } from '../types';

export const FALLBACK_ANALYTICS: AnalyticsResponse = {
  overview: {
    total_members: 16556,
    profiles_processed: 16556,
    pending_profiles: 0,
    members_with_websites: 480,
    members_with_social: 1250,
    failed_records: 0,
    duplicate_records: 28,
    success_percentage: 100.0,
    total_qualifications: 18710,
    total_links: 2150
  },
  country_distribution: [
    { label: "Turkey", count: 3771, percentage: 22.8 },
    { label: "Netherlands", count: 2045, percentage: 12.4 },
    { label: "India", count: 1559, percentage: 9.4 },
    { label: "Greece", count: 959, percentage: 5.8 },
    { label: "Belgium", count: 699, percentage: 4.2 },
    { label: "Spain", count: 677, percentage: 4.1 },
    { label: "Sweden", count: 632, percentage: 3.8 },
    { label: "Iran", count: 618, percentage: 3.7 },
    { label: "Norway", count: 556, percentage: 3.4 },
    { label: "Lebanon", count: 463, percentage: 2.8 }
  ],
  qualification_distribution: [
    { label: "Personal Trainer", count: 9420, percentage: 56.9 },
    { label: "Fitness Instructor", count: 4120, percentage: 24.9 },
    { label: "Group Fitness Instructor", count: 2450, percentage: 14.8 },
    { label: "Pilates Teacher - Matwork", count: 1210, percentage: 7.3 },
    { label: "Graduate Exercise Professional", count: 890, percentage: 5.4 }
  ],
  platform_distribution: [
    { label: "INSTAGRAM", count: 1280, percentage: 59.5 },
    { label: "LINKEDIN", count: 410, percentage: 19.1 },
    { label: "PERSONAL WEBSITE", count: 280, percentage: 13.0 },
    { label: "FACEBOOK", count: 120, percentage: 5.6 },
    { label: "TWITTER X", count: 42, percentage: 2.0 },
    { label: "YOUTUBE", count: 18, percentage: 0.8 }
  ],
  missing_fields_stats: {
    missing_city: 12,
    missing_expiry: 0,
    missing_bio: 0,
    missing_specialties: 0,
    pending_profiles: 0
  },
  performance_metrics: {
    avg_extraction_latency_ms: 12.4,
    db_query_time_ms: 3.8,
    duplicate_rate_percentage: 0.17,
    verification_accuracy_percentage: 100.0
  }
};

export const FALLBACK_MEMBERS: Member[] = [
  {
    member_id: "EREPS-4080",
    first_name: "Koen",
    last_name: "Daelewyn",
    full_name: "Koen Daelewyn",
    city: "Aalst",
    country: "Belgium",
    raw_country: "Belgium",
    professional_category: "Personal Trainer",
    master_trainer_status: false,
    expiry_date: "2026-12-12",
    profile_url: "https://www.ereps.eu/member-profile/4080",
    source_provenance: "https://www.ereps.eu/member-directory (Authentic Live)",
    permission_basis: "Public Register of Exercise Professionals",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    qualifications: [
      {
        id: 1,
        member_id: "EREPS-4080",
        qualification_name: "Personal Trainer",
        eqf_level: "EQF Certified",
        discipline: "Personal Trainer",
        awarding_body: "EuropeActive Accredited Body (Belgium)",
        expiry_date: "2026-12-12",
        is_master_trainer: false,
        created_at: new Date().toISOString()
      }
    ],
    profile: {
      id: 1,
      member_id: "EREPS-4080",
      description: "Koen Daelewyn is an accredited fitness professional registered on the European Register of Exercise Professionals (EREPS) in Aalst, Belgium.",
      specialties: "Personal Trainer",
      original_profile_url: "https://www.ereps.eu/member-profile/4080",
      source_status: "live_extracted",
      extraction_date: new Date().toISOString()
    },
    links: [
      {
        id: 1,
        member_id: "EREPS-4080",
        platform: "personal_website",
        original_url: "http://www.yourvytalcoach.be",
        clean_url: "http://www.yourvytalcoach.be",
        link_type: "website",
        is_verified: true,
        last_checked: new Date().toISOString(),
        source_profile_url: "https://www.ereps.eu/member-profile/4080"
      },
      {
        id: 2,
        member_id: "EREPS-4080",
        platform: "instagram",
        original_url: "https://www.instagram.com/yourvytalcoach/",
        clean_url: "https://www.instagram.com/yourvytalcoach",
        link_type: "social",
        is_verified: true,
        last_checked: new Date().toISOString(),
        source_profile_url: "https://www.ereps.eu/member-profile/4080"
      }
    ]
  },
  {
    member_id: "EREPS-4001",
    first_name: "Khalid",
    last_name: "El Ayadi",
    full_name: "Khalid El Ayadi",
    city: "Brussels",
    country: "Belgium",
    raw_country: "Belgium",
    professional_category: "Group Fitness Instructor, Graduate Exercise Professional",
    master_trainer_status: false,
    expiry_date: "2027-08-21",
    profile_url: "https://www.ereps.eu/member-profile/4001",
    source_provenance: "https://www.ereps.eu/member-directory (Authentic Live)",
    permission_basis: "Public Register of Exercise Professionals",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    qualifications: [
      {
        id: 2,
        member_id: "EREPS-4001",
        qualification_name: "Group Fitness Instructor",
        eqf_level: "EQF Certified",
        discipline: "Group Fitness Instructor",
        awarding_body: "EuropeActive Accredited Body (Belgium)",
        expiry_date: "2027-08-21",
        is_master_trainer: false,
        created_at: new Date().toISOString()
      }
    ],
    profile: {
      id: 2,
      member_id: "EREPS-4001",
      description: "Khalid El Ayadi is an accredited fitness professional registered on the European Register of Exercise Professionals (EREPS) in Brussels, Belgium.",
      specialties: "Group Fitness Instructor, Graduate Exercise Professional",
      original_profile_url: "https://www.ereps.eu/member-profile/4001",
      source_status: "live_extracted",
      extraction_date: new Date().toISOString()
    },
    links: []
  }
];
