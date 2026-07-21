#!/usr/bin/env python3
# ==============================================================================
# INSO CODE - HSM KMS SECRETS INJECTION MOCK
# ==============================================================================
# Complies with Law 3 (HSM KMS Artifact Signing / Secrets).
# This script simulates pulling secrets from a secure hardware vault
# and safely injecting them into the .env.production templates.

import os
import secrets

def fetch_hsm_secret(secret_id: str) -> str:
    """Mock fetching a secure payload from PKCS#11 HSM."""
    print(f"[HSM Mock] Decrypting {secret_id} via Sovereign KMS...")
    if secret_id == "STRIPE_SECRET":
        return "sk_live_mock_" + secrets.token_hex(16)
    elif secret_id == "DATABASE_URL":
        return "postgresql://inso_admin:secure_password@postgres.internal:5432/insocode?sslmode=require"
    elif secret_id == "JWT_SECRET":
        return secrets.token_hex(32)
    return "UNKNOWN_SECRET"

def inject_secrets():
    print("🔒 Initiating HSM Secrets Injection Sequence...")
    
    # Paths
    backend_env = "Inso.Code.Backend/.env.production"
    frontend_env = "Inso.Code.Frontend/.env.production"
    
    # Mock Fetch
    stripe_key = fetch_hsm_secret("STRIPE_SECRET")
    db_url = fetch_hsm_secret("DATABASE_URL")
    jwt_key = fetch_hsm_secret("JWT_SECRET")

    # Inject Backend
    if os.path.exists(backend_env):
        with open(backend_env, "r") as f:
            content = f.read()
        content = content.replace('STRIPE_SECRET_KEY=""', f'STRIPE_SECRET_KEY="{stripe_key}"')
        content = content.replace('DATABASE_URL=""', f'DATABASE_URL="{db_url}"') # Assuming it was empty
        content = content.replace('JWT_ACCESS_TOKEN=""', f'JWT_ACCESS_TOKEN="{jwt_key}"')
        with open(backend_env, "w") as f:
            f.write(content)
        print(f"✅ Injected secrets into {backend_env}")

    # Inject Frontend
    if os.path.exists(frontend_env):
        with open(frontend_env, "r") as f:
            content = f.read()
        content = content.replace('NEXTAUTH_SECRET=""', f'NEXTAUTH_SECRET="{jwt_key}"')
        with open(frontend_env, "w") as f:
            f.write(content)
        print(f"✅ Injected secrets into {frontend_env}")

if __name__ == "__main__":
    inject_secrets()
