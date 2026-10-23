# Daily Feed Visibility Issue - Diagnostic Resources

## Problem Statement
Employee posts in `/daily-feed` are not visible to other employees.

## Diagnostic Tools Created

### 1. **SQL Diagnostic Script** 
📁 `supabase/diagnostics/daily_feed_visibility_check.sql`

**Purpose:** Comprehensive 9-point check of:
- RLS policies
- User roles
- Auth context
- Report visibility
- Database state

**How to use:**
1. Open Supabase Dashboard → SQL Editor
2. Copy entire script
3. Run it
4. Review results for each of 9 checks

---

### 2. **SQL Fix Script**
📁 `supabase/diagnostics/daily_feed_visibility_fix.sql`

**Purpose:** Applies fixes for common issues:
- Re-creates correct RLS policy
- Updates NULL user roles (optional)
- Verifies RLS is enabled
- Tests visibility after fixes

**How to use:**
1. Run diagnostic script first
2. Based on results, uncomment fixes as needed
3. Run fix script
4. Verify results

---

### 3. **Debugging Guide**
📁 `DEBUGGING_daily_feed_visibility.md`

**Purpose:** Step-by-step troubleshooting guide with:
- Root cause analysis
- Interpretation of diagnostic results
- Manual verification steps
- Alternative fixes
- Expected behavior after fix

**How to use:**
- Follow step-by-step process
- Reference when interpreting diagnostic output

---

### 4. **Browser Console Test**
📁 `supabase/diagnostics/browser_console_test.js`

**Purpose:** Client-side verification of:
- User authentication
- Visible reports on page
- Date parameters
- LocalStorage auth state

**How to use:**
1. Navigate to `/daily-feed` in browser
2. Open DevTools Console (F12)
3. Copy and paste entire script
4. Press Enter
5. Review output

---

## Quick Diagnosis Flow

```
START
  ↓
Run SQL Diagnostic Script
  ↓
Check "Check 1: RLS POLICIES"
  ↓
┌─────────────────────────────────────┐
│ Policy name?                         │
├─────────────────────────────────────┤
│ daily_reports_select_team → OK ✅   │
│ daily_reports_select_own  → FIX ❌  │
└─────────────────────────────────────┘
  ↓
Check "Check 2: USER_ROLE"
  ↓
┌─────────────────────────────────────┐
│ Returns EMPLOYEE?                    │
├─────────────────────────────────────┤
│ Yes → OK ✅                          │
│ NULL → FIX user profile ❌          │
└─────────────────────────────────────┘
  ↓
Check "Check 5: REPORTS VISIBLE"
  ↓
┌─────────────────────────────────────┐
│ unique_authors > 1?                  │
├─────────────────────────────────────┤
│ Yes → Working! ✅                    │
│ No → Run Fix Script ❌              │
└─────────────────────────────────────┘
  ↓
Run SQL Fix Script
  ↓
Test in application with 2 users
  ↓
DONE
```

---

## Most Common Issues & Fixes

### Issue 1: Old RLS Policy Active
**Symptom:** Check 1 shows `daily_reports_select_own`  
**Fix:** Run fix script to apply `daily_reports_select_team`  
**Root cause:** Migration 016 was never applied

### Issue 2: NULL User Roles
**Symptom:** Check 2 returns NULL, Check 3 shows users without roles  
**Fix:** Uncomment UPDATE statement in fix script  
**Root cause:** Profiles created without role assignment

### Issue 3: Auth Context Missing
**Symptom:** Check 2 shows NULL user_id  
**Fix:** User is not logged in properly, check auth flow  
**Root cause:** Session not established or cookies not working

---

## Technical Background

### How Visibility Works

1. **User logs in** → Session stored in cookies
2. **Page loads** (`app/daily-feed/page.tsx`) → Server component
3. **Creates Supabase client** (`src/lib/supabase/server.ts`) → Uses cookies for auth
4. **Queries daily_reports** → `getAllReportsByDate(date)`
5. **RLS policy evaluates** → `public.user_role() IN ('EMPLOYEE', ...)`
6. **Returns filtered results** → Only what user can see

### The RLS Policy

```sql
CREATE POLICY "daily_reports_select_team"
  ON public.daily_reports FOR SELECT
  USING (public.user_role() IN ('EMPLOYEE', 'PROJECT_MANAGER', 'ADMIN'));
```

This means:
- ✅ Any EMPLOYEE can see ALL reports
- ✅ PROJECT_MANAGERs can see ALL reports
- ✅ ADMINs can see ALL reports
- ❌ Users with NULL or other roles cannot see any reports

### The user_role() Function

```sql
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

This function:
- Gets current user's ID from `auth.uid()`
- Looks up their role in `profiles` table
- Returns the role string (or NULL if not found)

---

## Testing Checklist

- [ ] SQL diagnostic script run
- [ ] All 9 checks reviewed
- [ ] RLS policy is `daily_reports_select_team`
- [ ] All users have valid roles (EMPLOYEE, PROJECT_MANAGER, or ADMIN)
- [ ] Fix script applied (if needed)
- [ ] Tested with Employee A posting report
- [ ] Logged in as Employee B
- [ ] Employee B can see Employee A's report
- [ ] Both users see each other's reports
- [ ] Date navigation works
- [ ] Edit/delete only works for own reports

---

## Support

If issues persist after running all diagnostics and fixes:

1. Share output of SQL diagnostic script (all 9 checks)
2. Share output of SQL fix script
3. Share screenshot of Supabase RLS policies page
4. Share screenshot of `/daily-feed` as two different users
5. Check server logs for any Supabase errors

---

## Files Reference

```
dayonecrm/
├── DEBUGGING_daily_feed_visibility.md          ← Main guide
├── supabase/
│   ├── diagnostics/
│   │   ├── daily_feed_visibility_check.sql    ← Diagnostic SQL
│   │   ├── daily_feed_visibility_fix.sql      ← Fix SQL
│   │   └── browser_console_test.js            ← Client test
│   └── migrations/
│       ├── 002_rls_policies.sql               ← user_role() function
│       ├── 014_daily_reports.sql              ← Table creation
│       └── 016_daily_reports_team_read.sql    ← Team visibility policy
└── src/
    ├── lib/
    │   ├── supabase/server.ts                 ← Server client
    │   └── team/report-queries.ts             ← Query functions
    └── components/
        └── daily-feed/DailyFeedClient.tsx     ← UI component
```

---

**Last Updated:** 2026-10-22  
**Version:** 1.0
