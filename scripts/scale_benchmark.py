"""
EREPS Synthetic 150,000 Scale Benchmark Script
Tests database indexing, bulk ingestion performance, and pagination latency.
"""
import sys
import time
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.services.extraction_engine import ExtractionEngine
from backend.app.models.member import Member

def main():
    target = 150000
    if len(sys.argv) > 1:
        target = int(sys.argv[1])

    print(f"==================================================")
    print(f"EREPS SCALE BENCHMARK: Target {target:,} Records")
    print(f"==================================================")

    db = SessionLocal()
    try:
        current = db.query(Member).count()
        print(f"Current database records: {current:,}")
        
        print(f"Starting bulk generation and index validation...")
        res = ExtractionEngine.benchmark_scale_150k(db, target_count=target, batch_size=5000)
        
        print("\nBenchmark Results:")
        for k, v in res.items():
            print(f" - {k}: {v}")

        # Test index query latency
        print("\nTesting Query Response Times on Indexed Columns:")
        t0 = time.time()
        c_count = db.query(Member).filter(Member.country == "Germany").count()
        t1 = time.time()
        print(f" - Country Filter Count: {c_count:,} in {(t1-t0)*1000:.2f} ms")

        t0 = time.time()
        q_count = db.query(Member).filter(Member.professional_category == "Personal Trainer").count()
        t1 = time.time()
        print(f" - Qualification Filter Count: {q_count:,} in {(t1-t0)*1000:.2f} ms")

        t0 = time.time()
        page_results = db.query(Member).order_by(Member.created_at.desc()).limit(20).all()
        t1 = time.time()
        print(f" - Page 1 Query (20 records): {(t1-t0)*1000:.2f} ms")

    finally:
        db.close()

if __name__ == "__main__":
    main()
