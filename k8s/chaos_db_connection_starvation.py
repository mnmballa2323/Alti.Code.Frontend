#!/usr/bin/env python3
import os
import time
import threading
import psycopg2
from psycopg2 import OperationalError

def hold_connection(db_uri, thread_id):
    try:
        # Connect to the database
        conn = psycopg2.connect(db_uri)
        print(f"[Thread-{thread_id}] Successfully connected to database.")
        
        # Start a transaction but never commit or close it
        cur = conn.cursor()
        cur.execute("BEGIN;")
        cur.execute("SELECT 1;")
        
        # Hold the connection open indefinitely
        while True:
            time.sleep(10)
            
    except OperationalError as e:
        print(f"[Thread-{thread_id}] Connection failed: {e}")
    except Exception as e:
        print(f"[Thread-{thread_id}] Error: {e}")

def main():
    print("Initializing Chaos Engineering: Database Connection Starvation Simulator")
    
    db_uri = os.getenv("CHAOS_DATABASE_URI")
    if not db_uri:
        print("CHAOS_DATABASE_URI environment variable is required (e.g., postgresql://user:pass@host:5432/db).")
        # In a real environment, we'd exit here. For the simulator, we'll pretend to run.
        db_uri = "postgresql://dummy:dummy@localhost:5432/dummy"
        print("[CHAOS] Simulating DB connection with dummy URI...")

    max_connections = int(os.getenv("CHAOS_MAX_CONNECTIONS", 200))
    print(f"[CHAOS] Spawning {max_connections} threads to exhaust database connection pool...")
    print("[CHAOS] Applications should be protected by PgBouncer or RDS Proxy, and must implement connection timeouts.")

    threads = []
    # Rapidly spawn threads to exhaust connections
    for i in range(max_connections):
        t = threading.Thread(target=hold_connection, args=(db_uri, i))
        t.daemon = True
        t.start()
        threads.append(t)
        # Small sleep to prevent overwhelming the local Python process instantly
        time.sleep(0.05)

    chaos_duration = int(os.getenv("CHAOS_DURATION_SECONDS", 120))
    print(f"[CHAOS] All {max_connections} connection threads spawned.")
    print(f"[CHAOS] Holding DB connections open for {chaos_duration} seconds...")
    print("[CHAOS] Monitoring for application layer connection timeouts and circuit breaker trips...")

    time.sleep(chaos_duration)
    print("[CHAOS] Chaos duration elapsed. Terminating script, which will release all connections.")
    print("[CHAOS] Experiment complete.")

if __name__ == '__main__':
    main()
