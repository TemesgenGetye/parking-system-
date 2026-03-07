# Supabase Database Schema - Selam Parking System

## How to run

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **SQL Editor** → **New query**
3. Copy all of `schema.sql` and paste
4. Click **Run**

**Important:** Run these migrations in the SQL Editor if needed:

1. `migrations/20250302_zone_availability_trigger.sql` if:
   - **Complete/Cancel buttons don't work** (requires `parking_sessions` UPDATE policy)
   - Zones don't become available again after completing/cancelling (requires zone trigger)
   - Zones don't become unavailable when parking starts

2. `migrations/20250307_fix_zone_delete_and_policies.sql` if:
   - **Zone delete fails** with "referenced by foreign key" (adds DELETE policies + ON DELETE CASCADE)
   - **Zone add/edit fails** (adds missing RLS policies)

---

## Tables & which tabs use them

| Table | Used by |
|-------|---------|
| **parking_zones** | Zones tab, QR Codes tab, User portal, Booking |
| **parking_sessions** | Booking, History, Analytics, User portal, Success |
| **payments** | Payment integration, Analytics |
| **zone_audit_log** | Zones tab (change history) |
| **qr_scan_events** | QR Codes tab, Analytics (scan tracking) |
| **session_audit_log** | History tab (session change tracking) |

---

## Table definitions

### parking_zones
Zone name, code, hourly rate, availability.

### parking_sessions
Each parking session: zone, vehicle, times, fees, status, source (admin/user_portal).

### payments
Payment method, status, amount per session.

### zone_audit_log
Logs create/update/delete on zones (auto-filled by trigger).

### qr_scan_events
Logs when a user scans a zone QR and lands on the user portal.

### session_audit_log
Logs session creation and status changes (auto-filled by trigger).

---

## Views

| View | Purpose |
|------|---------|
| **parking_sessions_with_zone** | Sessions with zone details (History, Analytics) |
| **analytics_daily_summary** | Daily totals (sessions, revenue) |
| **analytics_by_zone** | Revenue and sessions per zone |
| **analytics_qr_usage** | QR scan counts per zone |

---

## Tab → data mapping

| Tab | Tables / views |
|-----|----------------|
| **Parking Zones** | parking_zones, zone_audit_log |
| **History** | parking_sessions, parking_sessions_with_zone, session_audit_log |
| **QR Codes** | parking_zones, qr_scan_events, analytics_qr_usage |
| **Analytics** | analytics_daily_summary, analytics_by_zone, analytics_qr_usage, parking_sessions_with_zone |

---

## Environment variables

The app reads from `.env.local` (already configured with your keys). Get your values from Supabase Dashboard → Project Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL` – Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – `anon` / `public` key (long JWT starting with `eyJ...`)
