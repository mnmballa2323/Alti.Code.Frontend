# Apple Pay Domain Verification

To complete Apple Pay setup for Stripe in production:

1. Go to your Stripe Dashboard (under **Settings > Payment Methods > Apple Pay**).
2. Click **Add new domain** and register `americanprivatecloud.com`.
3. Download the domain association file provided by Stripe.
4. Replace this file or rename your downloaded file to:
   `apple-developer-merchantid-domain-association`
5. Place it in this directory (`public/.well-known/`).
6. Once deployed, the file will be accessible at:
   `https://americanprivatecloud.com/.well-known/apple-developer-merchantid-domain-association`
7. Click **Verify** in the Stripe Dashboard to finalize domain mapping.
