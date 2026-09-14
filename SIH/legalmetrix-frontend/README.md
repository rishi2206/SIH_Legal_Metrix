# LegalMetriX — Frontend

A plain **React + JavaScript** (no TypeScript) frontend for the `interconn-backend`
Spring Boot API, covering both the Supervisor and Admin roles.

## Run it

```bash
npm install
cp .env.example .env      # points to http://localhost:8080 by default
npm run dev
```

Opens at `http://localhost:3000`.

## Login flow

`/login` first shows a role picker — **Login as Admin** / **Login as Supervisor**
— then a plain email/password form. Both hit the same `POST /api/auth/login`;
after a successful login the frontend checks the role in the response against
which button was chosen and rejects a mismatch (e.g. a supervisor account
used on the "Login as Admin" button) with a clear message, logging them back out.

There's a built-in admin already seeded by the backend's `DataInitializer`:

```
email:    admin@interconn.com
password: Admin@123
```

## Creating & activating supervisors (admin-only)

Only an admin can create a supervisor account (`POST /api/admin/supervisors`,
already role-gated on the backend). After creating one, the admin panel shows
an **"Open activation link"** button that goes straight to `/activate?token=...`
to set that supervisor's password — no separate link is exposed anywhere on
the public login screen anymore. The token/link can also be copied to send to
the supervisor so they can activate it on their own device instead.

## Camera capture for evidence photos

On the inspection detail page, "Take photo" opens the device camera directly
(via `getUserMedia`) instead of only picking an existing file — capture, retake,
or confirm, then it's uploaded through the same `POST /evidence/upload` flow
and feeds into OCR → extraction → compliance the same way a picked file does.
"Choose file" is still there as a fallback for browsers/devices without camera
access.

Note: browsers only allow camera access on `https://` or on `localhost` —
if you test on a phone over your LAN IP (e.g. `http://192.168.x.x:3000`)
the camera button won't work unless that's served over HTTPS.

## One backend change is required: CORS

The backend (as uploaded) has **no CORS configuration**, so a browser page served
from `localhost:3000` calling `localhost:8080` gets blocked before any request
reaches your controllers — nothing in this frontend will work without it.

Two files are included alongside this project, under `backend-patch/`:

- `config/CorsConfig.java` — **new file**, add it to
  `src/main/java/com/interconn/config/`.
- `security/SecurityConfig.java` — **replaces** your existing file at
  `src/main/java/com/interconn/security/SecurityConfig.java`. The only change
  is one new constructor parameter (`CorsConfigurationSource`) and one new
  line, `.cors(cors -> cors.configurationSource(corsConfigurationSource))`,
  added to the security filter chain. Nothing else was touched — diff it
  against your original if you want to double check.

This allows `http://localhost:*` origins and is meant for local development.
Restrict `setAllowedOriginPatterns(...)` to your real frontend domain before
deploying anywhere public.

## What's wired up

Every screen calls the real API — nothing is mocked:

| Area | Endpoints used |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/supervisors/activate` |
| Dashboards | `GET /api/dashboard/supervisor`, `GET /api/dashboard/admin` |
| History | `GET /api/history/supervisor`, `GET /api/history/admin` |
| Inspections | `POST /api/inspections`, `GET /api/inspections/my`, `GET /api/inspections/{id}` |
| Evidence | `GET/POST /api/inspections/{id}/evidence(/upload)` |
| OCR | `POST /api/inspections/{id}/process` |
| Extraction | `POST /api/inspections/{id}/extract`, `GET .../extraction` |
| Products | `POST/GET /api/inspections/{id}/products`, `PUT .../products/{productId}` |
| Compliance | `POST /api/inspections/{id}/validate`, `GET .../violations`, `GET .../result` |
| Reports | `POST/GET /api/inspections/{id}/report` |
| Admin | `POST/GET /api/admin/supervisors`, `GET /api/admin/supervisors/{id}` |

Login stores the JWT in `localStorage` and sends it as `Authorization: Bearer <token>`
on every subsequent request.

## Known backend-side limitation

`InspectionService.getInspection()` only allows the **owning supervisor** to
open an inspection's detail — an admin gets rejected even though
`GET /api/history/admin` lists every inspection. So on the Admin → History
page, rows are shown read-only (no link into the detail workflow) rather than
linking somewhere that would 404. If you want admins to be able to drill in,
that ownership check in the backend would need to allow `ADMIN` role through
too — I left it as-is since you said the backend is working correctly.

## Notes on scope / simplifications

The original TypeScript mock frontend had a lot of fields with no backend
counterpart (badge numbers, GPS coordinates, zones/districts, duty status,
activity feeds, quotas, etc.). Rather than keep inventing fake data now that
mocking is off, screens here only show what the real API returns. The compliance
inspection workflow (evidence → OCR → extract → products → validate → report)
is consolidated onto one inspection detail page instead of many separate
step-pages, per your "keep it simple" request.

## Dark mode background fix

The color system (light/dark tokens, same palette) is carried over from the
original design. Previously only `<body>` got the theme background color, so
areas taller than the page content (mobile overscroll, short pages) could
flash the browser's default white canvas in dark mode. This version also sets
the background on `<html>` and adds `color-scheme` so native scrollbars/inputs
switch too — see the comment in `src/index.css`.
