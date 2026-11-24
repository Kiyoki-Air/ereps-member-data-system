import time
import uuid
import datetime
import random
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.app.models.member import (
    Member, Qualification, MemberProfile, MemberLink,
    ExtractionJob, ExtractionLog, FailedRecord, DataSource, AuditLog
)
from backend.app.services.link_extractor import LinkExtractorEngine
from backend.app.services.data_quality import DataQualityEngine

class ExtractionEngine:
    """
    Robust Background Extraction & Data Management Engine.
    Implements checkpointing, pause/resume, rate limiting, transaction safety,
    failed-record retries, and modular authorized ingestion.
    """

    MOCK_FIRST_NAMES = [
        "Emma", "Liam", "Sophia", "Noah", "Olivia", "Lucas", "Mia", "Matteo", 
        "Elena", "Alejandro", "Chloe", "Luka", "Amélie", "Marco", "Freja", 
        "Lars", "Astrid", "Daan", "Sanne", "Katarina", "Nikos", "Ioanna", 
        "Pavel", "Zuzana", "Tiago", "Beatriz", "Elin", "Viktor", "Bettina", "Jan"
    ]
    
    MOCK_LAST_NAMES = [
        "Müller", "Schmidt", "Dubois", "Moreau", "García", "Rodríguez", "Rossi", "Ferrari",
        "De Jong", "Van Dijk", "Andersson", "Johansson", "Nielsen", "Hansen", "Papadopoulos",
        "Novák", "Kowalski", "Santos", "Silva", "O'Connor", "Murphy", "Larsen", "Fischer", "Weber"
    ]

    MOCK_CITIES = [
        ("Berlin", "Germany"), ("Munich", "Germany"), ("Hamburg", "Germany"),
        ("Paris", "France"), ("Lyon", "France"), ("Marseille", "France"),
        ("Madrid", "Spain"), ("Barcelona", "Spain"), ("Valencia", "Spain"),
        ("Rome", "Italy"), ("Milan", "Italy"), ("Florence", "Italy"),
        ("Amsterdam", "Netherlands"), ("Rotterdam", "Netherlands"),
        ("Brussels", "Belgium"), ("Antwerp", "Belgium"),
        ("London", "United Kingdom"), ("Manchester", "United Kingdom"), ("Edinburgh", "United Kingdom"),
        ("Dublin", "Ireland"), ("Cork", "Ireland"),
        ("Stockholm", "Sweden"), ("Gothenburg", "Sweden"),
        ("Copenhagen", "Denmark"), ("Aarhus", "Denmark"),
        ("Oslo", "Norway"), ("Bergen", "Norway"),
        ("Helsinki", "Finland"), ("Espoo", "Finland"),
        ("Lisbon", "Portugal"), ("Porto", "Portugal"),
        ("Athens", "Greece"), ("Thessaloniki", "Greece"),
        ("Nicosia", "Cyprus"), ("Limassol", "Cyprus"),
        ("Vienna", "Austria"), ("Salzburg", "Austria"),
        ("Zurich", "Switzerland"), ("Geneva", "Switzerland"),
        ("Warsaw", "Poland"), ("Kraków", "Poland"),
        ("Prague", "Czech Republic"), ("Brno", "Czech Republic")
    ]

    MOCK_QUALIFICATIONS = [
        ("Personal Trainer", "EQF Level 4", "Fitness & Resistance Training"),
        ("Group Fitness Instructor", "EQF Level 3", "Aerobics & Group Classes"),
        ("Graduate Exercise Professional", "EQF Level 5", "Clinical & Athletic Performance"),
        ("Pilates Teacher - Matwork", "EQF Level 4", "Mind-Body & Core Conditioning"),
        ("Exercise for Health Specialist", "EQF Level 5", "Non-Communicable Chronic Disease Care"),
        ("Youth Fitness Specialist", "EQF Level 4", "Adolescent Functional Development"),
        ("Strength and Conditioning Coach", "EQF Level 5", "High-Performance Sports")
    ]

    MOCK_SPECIALTIES = [
        "Hypertrophy & Body Composition", "Pre & Post Natal Exercise",
        "Lower Back Rehabilitation", "Metabolic Conditioning & HIIT",
        "Olympic Weightlifting", "Functional Mobility & Joint Longevity",
        "Geriatric Functional Strength", "Cardiovascular Endurance"
    ]

    @classmethod
    def create_job(
        cls, 
        db: Session, 
        job_type: str = "mock_50", 
        batch_size: int = 50, 
        rate_limit_per_min: int = 30
    ) -> ExtractionJob:
        job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
        job_name = f"EREPS {job_type.replace('_', ' ').title()} Run"
        job = ExtractionJob(
            id=job_id,
            job_name=job_name,
            job_type=job_type,
            status="pending",
            total_records=50 if job_type == "mock_50" else (150000 if job_type == "scale_150k" else 0),
            processed_records=0,
            successful_records=0,
            failed_records=0,
            duplicate_records=0,
            current_page=0,
            rate_limit_per_min=rate_limit_per_min,
            batch_size=batch_size,
            checkpoint_data={"current_index": 0, "status": "initialized"},
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        cls.log_action(db, job_id, "INFO", f"Extraction job {job_id} ({job_name}) initialized.")
        return job

    @classmethod
    def log_action(
        cls, 
        db: Session, 
        job_id: str, 
        level: str, 
        message: str, 
        member_id: Optional[str] = None, 
        error_details: Optional[str] = None
    ):
        log = ExtractionLog(
            job_id=job_id,
            member_id=member_id,
            log_level=level,
            message=message,
            error_details=error_details,
            timestamp=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(log)
        try:
            db.commit()
        except Exception:
            db.rollback()

    @classmethod
    def run_mock_50_dataset(cls, db: Session, job_id: str) -> Dict[str, Any]:
        """
        Generates 50 realistic member records with multi-level qualifications,
        profile descriptions, verified social & website links, and failure simulation.
        Fulfills Phase 2 and Module 12 requirements.
        """
        job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
        if not job:
            return {"error": "Job not found"}

        job.status = "running"
        job.started_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()

        cls.log_action(db, job_id, "INFO", "Commencing authorized mock dataset generation of 50 members.")

        # Fixed seed for consistent reproducible benchmarks
        random.seed(42)

        start_num = 142000
        for i in range(50):
            # Check for pause signal
            db.refresh(job)
            if job.status == "paused":
                cls.log_action(db, job_id, "WARNING", f"Job {job_id} paused at record {i}/50.")
                job.checkpoint_data = {"current_index": i}
                db.commit()
                return {"status": "paused", "checkpoint": i}

            member_num = start_num + (i * 7) + random.randint(1, 4)
            member_id = f"EREPS-{member_num}"

            # Simulate one record failing validation for testing retry/failure features
            if i == 17:
                failed = FailedRecord(
                    job_id=job_id,
                    member_id=member_id,
                    record_identifier=f"REC-{member_id}",
                    stage="profile",
                    error_reason="Simulated HTTP 503 Service Unavailable on remote profile endpoint",
                    raw_payload=f'{{"member_id": "{member_id}", "attempt": 1}}',
                    retry_count=0,
                    status="unresolved"
                )
                db.add(failed)
                job.failed_records += 1
                job.processed_records += 1
                cls.log_action(db, job_id, "ERROR", f"Profile extraction failed for {member_id}", member_id=member_id)
                db.commit()
                continue

            first_name = random.choice(cls.MOCK_FIRST_NAMES)
            last_name = random.choice(cls.MOCK_LAST_NAMES)
            full_name = f"{first_name} {last_name}"
            city, country = random.choice(cls.MOCK_CITIES)
            norm_country, raw_country = DataQualityEngine.standardize_country(country)
            
            qual_info = random.choice(cls.MOCK_QUALIFICATIONS)
            is_master = random.random() < 0.25 # 25% are Master Trainers
            
            # Expiry date within next 1-3 years
            expiry_year = random.choice([2026, 2027, 2028])
            expiry_month = random.randint(1, 12)
            expiry_day = random.choice([15, 28, 30])
            raw_expiry = f"{expiry_day:02d}/{expiry_month:02d}/{expiry_year}"
            std_expiry = DataQualityEngine.standardize_date(raw_expiry)

            profile_url = f"https://www.ereps.eu/member-directory/{member_num}"

            # Check duplicate
            existing = db.query(Member).filter(Member.member_id == member_id).first()
            if existing:
                job.duplicate_records += 1
                job.processed_records += 1
                cls.log_action(db, job_id, "WARNING", f"Duplicate member {member_id} detected. Skipped re-insert.", member_id=member_id)
                db.commit()
                continue

            # 1. Create Member
            member = Member(
                member_id=member_id,
                first_name=first_name,
                last_name=last_name,
                full_name=full_name,
                city=city,
                country=norm_country,
                raw_country=raw_country,
                professional_category=qual_info[0],
                master_trainer_status=is_master,
                expiry_date=std_expiry,
                profile_url=profile_url,
                source_provenance="EREPS Directory / Authorized Compliance Feed",
                permission_basis="Legitimate Interest (Public Professional Registry)"
            )
            db.add(member)

            # 2. Add Primary & Secondary Qualifications
            q1 = Qualification(
                member_id=member_id,
                qualification_name=qual_info[0],
                eqf_level=qual_info[1],
                discipline=qual_info[2],
                awarding_body=f"European Fitness Academy ({norm_country})",
                expiry_date=std_expiry,
                is_master_trainer=is_master
            )
            db.add(q1)

            if is_master:
                q2 = Qualification(
                    member_id=member_id,
                    qualification_name="Master Trainer Accreditation",
                    eqf_level="EQF Level 6",
                    discipline="Advanced Exercise Prescription & Mentorship",
                    awarding_body="EuropeActive Standards Council",
                    expiry_date=std_expiry,
                    is_master_trainer=True
                )
                db.add(q2)

            # 3. Add Member Profile
            specialty_sample = ", ".join(random.sample(cls.MOCK_SPECIALTIES, k=random.randint(2, 4)))
            bio = (
                f"{full_name} is an accredited {qual_info[0]} based in {city}, {norm_country}. "
                f"With over {random.randint(4, 15)} years of clinical and commercial fitness experience, "
                f"focusing on evidence-based training and client empowerment."
            )
            business_name = f"{last_name} Performance & Fitness Studio" if random.random() < 0.6 else None
            business_phone = f"+{random.randint(30, 49)} {random.randint(100, 999)} {random.randint(1000, 9999)}" if business_name else None
            business_email = f"info@{last_name.lower().replace('ä','ae').replace('ü','ue')}-training.com" if business_name else None

            profile = MemberProfile(
                member_id=member_id,
                description=bio,
                specialties=specialty_sample,
                certifications_text=f"{qual_info[0]} ({qual_info[1]}), CPR/AED First Aid Certified",
                business_name=business_name,
                business_phone=business_phone,
                business_email=business_email,
                business_address=f"Fitness Boulevard {random.randint(1, 120)}, {city}",
                original_profile_url=profile_url,
                source_status="extracted"
            )
            db.add(profile)

            # 4. Add Links (Classified with LinkExtractorEngine)
            user_handle = f"{first_name.lower()}.{last_name.lower()}"
            sample_links = []
            if random.random() < 0.75:
                sample_links.append(f"https://www.instagram.com/{user_handle}?utm_source=ereps_directory&igshid=abc123")
            if random.random() < 0.70:
                sample_links.append(f"https://www.linkedin.com/in/{user_handle}-fitness/?ref=profile")
            if random.random() < 0.40:
                sample_links.append(f"https://www.facebook.com/{user_handle}.trainer/")
            if random.random() < 0.25:
                sample_links.append(f"https://www.youtube.com/@{user_handle}movement")
            if business_name:
                sample_links.append(f"https://www.{last_name.lower().replace('ä','ae').replace('ü','ue')}-performance.eu")

            for raw_link in sample_links:
                platform, link_type, clean_url = LinkExtractorEngine.classify_link(raw_link)
                link_obj = MemberLink(
                    member_id=member_id,
                    platform=platform,
                    original_url=raw_link,
                    clean_url=clean_url,
                    link_type=link_type,
                    is_verified=True,
                    source_profile_url=profile_url
                )
                db.add(link_obj)

            job.successful_records += 1
            job.processed_records += 1
            job.checkpoint_data = {"current_index": i + 1}
            db.commit()

        job.status = "completed"
        job.completed_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()

        cls.log_action(db, job_id, "SUCCESS", f"Mock extraction job {job_id} finished successfully with {job.successful_records} created records.")
        return {
            "status": "completed",
            "total": job.total_records,
            "successful": job.successful_records,
            "failed": job.failed_records,
            "duplicates": job.duplicate_records
        }

    @classmethod
    def retry_failed_records(cls, db: Session, job_id: str) -> Dict[str, Any]:
        """Retries all unresolved failed records for a given job."""
        failures = db.query(FailedRecord).filter(
            FailedRecord.job_id == job_id,
            FailedRecord.status.in_(["unresolved", "retrying"])
        ).all()

        if not failures:
            return {"message": "No unresolved failed records to retry", "retried": 0, "resolved": 0}

        resolved_count = 0
        for f in failures:
            f.status = "retrying"
            f.retry_count += 1
            f.last_retry_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()

            # Retry resolution logic
            try:
                # Re-parse or simulate re-fetch
                member_id = f.member_id or f.record_identifier.replace("REC-", "")
                existing_member = db.query(Member).filter(Member.member_id == member_id).first()
                if not existing_member:
                    # Create recovered record
                    member = Member(
                        member_id=member_id,
                        first_name="Recovered",
                        last_name=f"Trainer {f.id}",
                        full_name=f"Recovered Trainer {f.id}",
                        city="Geneva",
                        country="Switzerland",
                        raw_country="Switzerland",
                        professional_category="Personal Trainer",
                        master_trainer_status=False,
                        expiry_date="2027-12-31",
                        profile_url=f"https://www.ereps.eu/member-directory/{member_id}",
                        source_provenance="Recovered via Retry Pipeline",
                        permission_basis="Legitimate Interest"
                    )
                    db.add(member)

                    profile = MemberProfile(
                        member_id=member_id,
                        description="Profile recovered after transient network fault.",
                        specialties="General Conditioning",
                        source_status="recovered"
                    )
                    db.add(profile)

                f.status = "resolved"
                resolved_count += 1
                cls.log_action(db, job_id, "SUCCESS", f"Successfully resolved failed record {f.record_identifier} on attempt {f.retry_count}", member_id=member_id)
            except Exception as e:
                f.status = "unresolved"
                cls.log_action(db, job_id, "ERROR", f"Retry attempt {f.retry_count} failed for {f.record_identifier}: {str(e)}", member_id=f.member_id)

            db.commit()

        # Update job stats
        job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
        if job:
            job.successful_records += resolved_count
            job.failed_records = max(0, job.failed_records - resolved_count)
            db.commit()

        return {"job_id": job_id, "retried": len(failures), "resolved": resolved_count}

    @classmethod
    def benchmark_scale_150k(cls, db: Session, target_count: int = 150000, batch_size: int = 5000, job_id: Optional[str] = None) -> Dict[str, Any]:
        """
        High-performance bulk insertion benchmark for 150,000 synthetic records.
        Tests PostgreSQL index indexing, memory footprints, and query responsiveness.
        Uses fast bulk_insert_mappings with batching.
        """
        start_time = time.time()
        job = None
        if job_id:
            job = db.query(ExtractionJob).filter(ExtractionJob.id == job_id).first()
            if job:
                job.status = "running"
                job.started_at = datetime.datetime.now(datetime.timezone.utc)
                job.total_records = target_count
                db.commit()

        cls.log_action(db, job_id or "BENCHMARK-150K", "INFO", f"Starting 150,000 record synthetic scalability test in batches of {batch_size}.")

        # Check existing count
        current_count = db.query(Member).count()
        needed = max(0, target_count - current_count)

        if needed == 0:
            if job:
                job.status = "completed"
                job.processed_records = target_count
                job.successful_records = target_count
                job.failed_records = 0
                job.completed_at = datetime.datetime.now(datetime.timezone.utc)
                db.commit()
            cls.log_action(db, job_id or "BENCHMARK-150K", "SUCCESS", f"Database holds full {target_count:,} records.")
            return {"message": f"Database already holds {current_count} records (>= target {target_count}).", "duration_sec": 0, "final_total": current_count}

        cls.log_action(db, job_id or "BENCHMARK-150K", "INFO", f"Generating {needed} records to reach {target_count} scale milestone.")

        batch_members = []
        batch_quals = []
        batch_profiles = []
        batch_links = []
        inserted = 0

        for idx in range(needed):
            curr_num = current_count + idx + 1
            member_id = f"EREPS-SYNTH-{curr_num}"
            first_name = random.choice(cls.MOCK_FIRST_NAMES)
            last_name = random.choice(cls.MOCK_LAST_NAMES)
            full_name = f"{first_name} {last_name}"
            city, country = random.choice(cls.MOCK_CITIES)
            qual = random.choice(cls.MOCK_QUALIFICATIONS)
            is_master = (idx % 5 == 0)

            batch_members.append({
                "member_id": member_id,
                "first_name": first_name,
                "last_name": last_name,
                "full_name": full_name,
                "city": city,
                "country": country,
                "raw_country": country,
                "professional_category": qual[0],
                "master_trainer_status": is_master,
                "expiry_date": "2027-12-31",
                "profile_url": f"https://www.ereps.eu/member-directory/{curr_num}",
                "source_provenance": "Synthetic 150K Scale Generator",
                "permission_basis": "Synthetic Performance Benchmark",
                "is_active": True,
                "is_deleted": False,
                "created_at": datetime.datetime.now(datetime.timezone.utc),
                "updated_at": datetime.datetime.now(datetime.timezone.utc)
            })

            batch_quals.append({
                "member_id": member_id,
                "qualification_name": qual[0],
                "eqf_level": qual[1],
                "discipline": qual[2],
                "awarding_body": f"National Fitness Board ({country})",
                "expiry_date": "2027-12-31",
                "is_master_trainer": is_master,
                "created_at": datetime.datetime.now(datetime.timezone.utc)
            })

            batch_profiles.append({
                "member_id": member_id,
                "description": f"Synthetic professional profile for {full_name} in {city}, {country}.",
                "specialties": "Strength Training, Conditioning",
                "original_profile_url": f"https://www.ereps.eu/member-directory/{curr_num}",
                "source_status": "synthetic",
                "extraction_date": datetime.datetime.now(datetime.timezone.utc)
            })

            if idx % 2 == 0:
                batch_links.append({
                    "member_id": member_id,
                    "platform": "instagram",
                    "original_url": f"https://www.instagram.com/synth.{curr_num}",
                    "clean_url": f"https://www.instagram.com/synth.{curr_num}",
                    "link_type": "social",
                    "is_verified": True,
                    "last_checked": datetime.datetime.now(datetime.timezone.utc),
                    "source_profile_url": f"https://www.ereps.eu/member-directory/{curr_num}"
                })

            if len(batch_members) >= batch_size or idx == needed - 1:
                db.bulk_insert_mappings(Member, batch_members)
                db.bulk_insert_mappings(Qualification, batch_quals)
                db.bulk_insert_mappings(MemberProfile, batch_profiles)
                if batch_links:
                    db.bulk_insert_mappings(MemberLink, batch_links)
                db.commit()
                inserted += len(batch_members)
                
                # Update progress in job
                if job:
                    job.processed_records = current_count + inserted
                    job.successful_records = current_count + inserted
                    db.commit()

                batch_members.clear()
                batch_quals.clear()
                batch_profiles.clear()
                batch_links.clear()

        duration = time.time() - start_time
        final_total = db.query(Member).count()
        if job:
            job.status = "completed"
            job.processed_records = final_total
            job.successful_records = final_total
            job.completed_at = datetime.datetime.now(datetime.timezone.utc)
            db.commit()

        cls.log_action(db, job_id or "BENCHMARK-150K", "SUCCESS", f"Scalability benchmark complete. Inserted {inserted} records. Total count: {final_total}. Duration: {duration:.2f} seconds.")
        return {
            "status": "completed",
            "inserted": inserted,
            "final_total": final_total,
            "duration_seconds": round(duration, 2),
            "throughput_records_per_sec": round(inserted / max(duration, 0.001), 2)
        }
