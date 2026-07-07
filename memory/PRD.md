# Sineann Winery — PRD

## Original Problem Statement
Modern web-based redesign for Sineann winery. Position the established winery brand first (heritage, craft, vineyard-driven wines), with the Train Graffiti Art Series as a current featured offering. Includes an admin CMS to manage wines, page content, news posts, media, and submissions. Buying is inquiry-based (no ecommerce). Subtle Celtic heritage cues, dark premium aesthetic inspired by Kerry Hill Winery.

## Stack
- Frontend: React (JSX) + Tailwind + shadcn/ui, framer aesthetics, sonner toasts
- Backend: FastAPI + MongoDB (motor)
- Auth: JWT Bearer (localStorage) + httpOnly cookie; single admin seeded from env
- Email: Resend (graceful fallback — inactive until RESEND_API_KEY set; submissions always stored)
- Media: Emergent Object Storage via EMERGENT_LLM_KEY

## User Choices
- Admin auth: JWT (recommended)
- Email: Resend
- No age gate
- Train Graffiti: dedicated page + homepage teaser
- Imagery: mix of AI-generated bottles/logo + stock winery photography

## Personas
- Customers exploring/buying wines (by inquiry)
- Visitors planning appointments/weekend visits
- Prospective Wine Club members
- Internal staff managing content

## Implemented (2026-07-07)
- Purchase inquiry form: "Which Wine?" (auto-selects viewed wine) + "How Many?" selectors; wine_interest & quantity stored, shown in admin, included in notification email.
- Story / Visit / Wine Club hero images now editable via Admin → Page Content (hero_image key; DB migration added on startup).
- Resend email dispatch ACTIVATED (RESEND_API_KEY set). Sends from onboarding@resend.dev to sineannwinery@outlook.com. NOTE: account unverified — 1 email/day cap until a domain is verified.

- Public site: Home, Our Wines (+ filters), Wine Detail (inquiry), Our Story (label history), Visit, Wine Club (Reds Only / All Wines), How to Buy, Train Graffiti Series page, News list + detail, Contact
- Reusable inquiry form (purchase / wine club / visit / general) + footer newsletter signup
- Celtic dividers, weave textures, dark luxury theme, Cormorant/Outfit typography
- Admin CMS (/admin): Wines CRUD, News CRUD, editable Page Content, Inquiries (read/delete), Newsletter (+CSV export), Media upload (object storage)
- Auto-seeded 6 wines, 3 posts, 7 page-content keys
- Tested: backend 27/27, frontend 17/17 — all passing

## Admin
admin@sineann.com / Sineann2026! (see /app/memory/test_credentials.md)

## Backlog / Next
- P0: Verify a sending domain in Resend (removes 1 email/day limit + enables reliable delivery to sineannwinery@outlook.com). Requires user's domain + DNS access. Update SENDER_EMAIL to a verified address after.
- P1: Add prices to the 13 real wines (awaiting pricing data from user; editable via CMS Wines tab).
- P2: Age verification gate (currently none, per user choice)
- P2: Replace native confirm() deletes with shadcn AlertDialog
- P2: Filterable wine archive (varietal/vintage/appellation), events calendar, richer label-history gallery
- P3: Migrate FastAPI startup/shutdown to lifespan handlers; split server.py into modules
- Future: full ecommerce checkout, trade/distributor inquiry page
