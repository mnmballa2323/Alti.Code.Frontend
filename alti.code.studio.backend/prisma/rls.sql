-- Enable Row-Level Security on critical tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBilling" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TokenUsageRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

-- Create policies for User
CREATE POLICY "Users can view their own record" ON "User"
    FOR SELECT
    USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update their own record" ON "User"
    FOR UPDATE
    USING (id = current_setting('app.current_user_id')::uuid);

-- Create policies for UserBilling
CREATE POLICY "Users can view their own billing" ON "UserBilling"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update their own billing" ON "UserBilling"
    FOR UPDATE
    USING ("userId" = current_setting('app.current_user_id')::uuid);

-- Create policies for TokenUsageRecord
CREATE POLICY "Users can view their own usage" ON "TokenUsageRecord"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id')::uuid);

-- Create policies for Invoice
CREATE POLICY "Users can view their own invoices" ON "Invoice"
    FOR SELECT
    USING ("userId" = current_setting('app.current_user_id')::uuid);

-- Note: Insert and Delete policies, as well as admin bypasses, would be added based on specific application requirements.
-- For a Supabase-like environment, `auth.uid()` would be used instead of `current_setting('app.current_user_id')`.
