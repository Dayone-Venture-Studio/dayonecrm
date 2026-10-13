-- ============================================================
-- Add Startup Health Metrics Columns
-- Add columns for cash runaway, burn rate, and CAC
-- ============================================================

-- Add health metrics columns to startups table
ALTER TABLE public.startups
ADD COLUMN IF NOT EXISTS cash_runaway_months INT,
ADD COLUMN IF NOT EXISTS monthly_burn_rate NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS customer_acquisition_cost NUMERIC(12, 2);

-- Add comments for documentation
COMMENT ON COLUMN public.startups.cash_runaway_months IS 'Number of months until cash runs out at current burn rate';
COMMENT ON COLUMN public.startups.monthly_burn_rate IS 'Monthly cash burn rate in INR';
COMMENT ON COLUMN public.startups.customer_acquisition_cost IS 'Cost to acquire one customer in INR';
