#!/usr/bin/env bash
# ==============================================================================
# provision-secrets.sh — One-shot Secret Manager provisioning for production
# ==============================================================================
# Usage:
#   1. Set PROJECT_ID below or export it: export GCP_PROJECT_ID=your-project-id
#   2. Run: bash scripts/provision-secrets.sh
#
# This script creates (or updates) all required secrets in Google Cloud Secret
# Manager. Values are read from the environment or prompted interactively.
# Run this ONCE before your first production deploy.
# ==============================================================================

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-${1:-}}"
if [[ -z "$PROJECT_ID" ]]; then
  echo "❌ GCP_PROJECT_ID is required. Set it as an env var or pass as first arg."
  exit 1
fi

echo "🔐 Provisioning Inso Code secrets in project: $PROJECT_ID"
echo ""

# Helper: create or update a secret
upsert_secret() {
  local NAME="$1"
  local VALUE="$2"

  if gcloud secrets describe "$NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo "  ↻ Updating existing secret: $NAME"
    echo -n "$VALUE" | gcloud secrets versions add "$NAME" \
      --data-file=- \
      --project="$PROJECT_ID"
  else
    echo "  + Creating secret: $NAME"
    echo -n "$VALUE" | gcloud secrets create "$NAME" \
      --data-file=- \
      --replication-policy="automatic" \
      --project="$PROJECT_ID"
  fi
}

# ── Prompt for values (or read from env) ────────────────────────────────────

read_secret() {
  local VAR_NAME="$1"
  local PROMPT="$2"
  local VALUE="${!VAR_NAME:-}"
  if [[ -z "$VALUE" ]]; then
    read -rsp "  $PROMPT: " VALUE
    echo ""
  else
    echo "  ✓ $PROMPT read from environment"
  fi
  echo "$VALUE"
}

echo "── Database ──────────────────────────────────────────────────────────────"
DB_URL=$(read_secret "DATABASE_URL" "DATABASE_URL (postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=10)")
upsert_secret "database-url" "$DB_URL"

echo ""
echo "── Redis ─────────────────────────────────────────────────────────────────"
REDIS_URL=$(read_secret "REDIS_URL" "REDIS_URL (redis://host:6379)")
upsert_secret "redis-url" "$REDIS_URL"

echo ""
echo "── JWT ───────────────────────────────────────────────────────────────────"
JWT_SECRET=$(read_secret "JWT_ACCESS_TOKEN" "JWT_ACCESS_TOKEN (64+ char random string)")
upsert_secret "jwt-secret" "$JWT_SECRET"

echo ""
echo "── NextAuth ──────────────────────────────────────────────────────────────"
NEXTAUTH_SECRET=$(read_secret "NEXTAUTH_SECRET" "NEXTAUTH_SECRET (32+ char random string, NOT the hardcoded one)")
upsert_secret "nextauth-secret" "$NEXTAUTH_SECRET"

echo ""
echo "── Gemini / Vertex AI ────────────────────────────────────────────────────"
GEMINI_KEY=$(read_secret "GEMINI_API_KEY" "GEMINI_API_KEY")
upsert_secret "gemini-api-key" "$GEMINI_KEY"

echo ""
echo "── Stripe ────────────────────────────────────────────────────────────────"
echo "  ⚠️  Use LIVE keys (sk_live_... / whsec_...). Test keys will be rejected at runtime."
STRIPE_SK=$(read_secret "STRIPE_SECRET_KEY" "STRIPE_SECRET_KEY (sk_live_...)")
upsert_secret "stripe-secret-key" "$STRIPE_SK"

STRIPE_WH=$(read_secret "STRIPE_WEBHOOK_SECRET" "STRIPE_WEBHOOK_SECRET (whsec_...)")
upsert_secret "stripe-webhook-secret" "$STRIPE_WH"

STRIPE_LAUNCH=$(read_secret "STRIPE_PRICE_LAUNCH" "STRIPE_PRICE_LAUNCH (price_... Cloud plan)")
upsert_secret "stripe-price-launch" "$STRIPE_LAUNCH"

STRIPE_BUILD=$(read_secret "STRIPE_PRICE_BUILD" "STRIPE_PRICE_BUILD (price_... Dedicated plan)")
upsert_secret "stripe-price-build" "$STRIPE_BUILD"

STRIPE_SCALE=$(read_secret "STRIPE_PRICE_SCALE" "STRIPE_PRICE_SCALE (price_... Sovereign plan)")
upsert_secret "stripe-price-scale" "$STRIPE_SCALE"

echo ""
echo "── Summary ───────────────────────────────────────────────────────────────"
echo "✅ All secrets provisioned in project: $PROJECT_ID"
echo ""
echo "Next steps:"
echo "  1. Grant the Cloud Run service account access to these secrets:"
echo "     gcloud projects add-iam-policy-binding $PROJECT_ID \\"
echo "       --member=serviceAccount:alti-backend-sa@$PROJECT_ID.iam.gserviceaccount.com \\"
echo "       --role=roles/secretmanager.secretAccessor"
echo ""
echo "  2. Deploy via Cloud Build:"
echo "     gcloud builds submit --config cloudbuild.yaml ."
echo ""
echo "  3. Verify the Stripe webhook endpoint in your Stripe Dashboard:"
echo "     https://dashboard.stripe.com/webhooks"
echo "     Endpoint URL: https://api.alticode.studio/api/v1/payment/webhook"
echo "     Events: checkout.session.completed, customer.subscription.*, invoice.payment_*"
