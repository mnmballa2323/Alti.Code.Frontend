# Enterprise Database Rollback & Migration Strategy

This document outlines the standard operating procedures (SOP) for managing database migrations, schema changes, and emergency rollbacks for the Alti Code Studio Backend.

## 1. Migration Safety & Code Promotion
- **No Destructive Operations**: Migrations must never contain `DROP COLUMN` or `DROP TABLE` operations directly if those tables/columns are actively used in the current production release. Use a multi-phase release process (Expand and Contract pattern).
- **Forward-Only Migrations**: Prisma migrations (`npx prisma migrate deploy`) are designed to be forward-only. Always ensure your application code is backwards-compatible with the old database schema before deploying.

## 2. Emergency Rollback Procedures (Zero-Downtime)

### Scenario A: Bad Code Deployment (Database is Intact)
If a backend deployment introduces a critical bug but the database schema hasn't materially broken existing data:
1. Instantly use the Cloud Provider UI to "Revert" to the previous known-good deployment.
2. The old code will still function correctly because migrations followed the Expand and Contract pattern (no columns were dropped).

### Scenario B: Bad Database Migration (Schema Corruption)
If a migration corrupts the schema or breaks the production application:
1. **DO NOT attempt to manually `migrate resolve --rolled-back` in production** unless strictly necessary, as this can lead to schema drift.
2. **Execute Point-in-Time Recovery (PITR)**: Use your managed database provider (e.g., GCP Cloud SQL, Supabase, Neon) to restore the database to the exact minute before the bad migration was applied.
3. Revert the application code to the previous deployment.

## 3. High Availability Checklist
- Ensure `pgvector` indexing (`optimize_hnsw_indexing.sql`) is applied during low-traffic periods to avoid table locks.
- Run `npx prisma migrate deploy` exclusively in the CI/CD pipeline, never from a local developer machine connecting to production.
