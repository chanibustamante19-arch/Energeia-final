# Energeia

Energeia is a mobile-focused household electricity tracking application. The React/Vite web app records and helps users understand electricity use through appliance-based estimates, user-entered meter readings and bills, history, recommendations, and what-if usage scenarios. The repository includes a Capacitor Android project that can be opened in Android Studio and built into an APK.

This README describes the system as currently implemented and identifies remaining Android release work separately. It is also intended as a technical reference for project and thesis documentation; calculations, implementation status, and limitations below should be reflected accurately in any academic description.

## System at a glance

- **Current application type:** Mobile-focused, responsive single-page web application (SPA).
- **Android delivery:** Capacitor Android project in `android/`; build and test APKs locally with Android Studio.
- **Frontend:** React 18, Vite, JavaScript/JSX, Tailwind CSS, and Radix UI-based components.
- **Navigation and charts:** React Router and Recharts.
- **Backend services:** Supabase Authentication and Supabase-hosted PostgreSQL.
- **Data access:** Supabase JavaScript client, with user-scoped data protected by PostgreSQL row-level security (RLS).
- **Current web deployment:** Configured for Vercel static hosting.
- **Primary use:** Household-level electricity tracking and estimation. The app does not currently collect live readings from a physical meter or utility provider.

## User-facing features

| Area | Route | What it does |
| --- | --- | --- |
| Landing and authentication | `/`, `/login`, `/register` | Introduces the app and supports email/password or Google sign-in through Supabase Auth. |
| Overview dashboard | `/overview` | Summarizes estimated appliance consumption and cost, recent bills, readings, active schedules, usage trends, and recommendations. |
| Appliances | `/appliances` | Adds and edits appliances, searches and filters the list, estimates monthly usage and cost, manages operating schedules, and archives appliances. |
| Consumption and billing history | `/history` | Records daily readings and billing periods, distinguishes estimated and actual bills, and displays monthly consumption/cost comparisons. |
| Energy insights | `/insights` | Shows rule-based runtime-reduction suggestions, filters them by impact, and lets a user dismiss or restore suggestions. |
| Scenarios | `/scenarios` | Changes appliance runtime values in a what-if estimate and saves named scenarios without changing the saved appliance data. |
| Settings | `/settings` | Edits profile and household details, provider and meter identifiers, billing cycle, electricity rate, appearance, and notification preferences. |

Authenticated routes are protected and redirect signed-out users to `/login`. Household data is loaded after authentication and shared between screens through the household data context.

## Typical data flow

1. A user registers or signs in through Supabase Auth.
2. A database trigger creates a profile, a default household, and an owner membership for a newly created auth user.
3. The frontend loads the user's household memberships and profile, then loads that household's appliances, bills, readings, scenarios, and dismissed-insight keys.
4. Users enter or edit records through the app. The frontend calls Supabase tables or database RPC functions using the configured public/publishable key and the signed-in session.
5. PostgreSQL constraints validate stored values, and RLS policies restrict rows to the relevant user or household members.
6. The app derives summaries, charts, estimated costs, scenarios, and recommendations from the stored records in the browser.

The selected household ID is stored in browser `localStorage` under `energeia-household-id`. This stores a selection only; authorization is enforced by Supabase policies, not by that local value.

## Android app (Capacitor)

The Android app packages the existing React/Vite frontend in a Capacitor Android project; it is not a separate Kotlin or Jetpack Compose implementation. The Capacitor configuration is in `capacitor.config.ts`, and the Android Studio project and Gradle wrapper are in `android/`. The launcher icon uses `frontend/public/energeia-logo.png`.

### Build a debug APK

1. Create a root `.env.local` with the Supabase project URL and public/publishable key as described in [Local development](#local-development). Do not use a service-role key.
2. From the repository root, build the web app and copy it into Android:

   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

3. Wait for Gradle sync in Android Studio. If prompted for a Gradle JDK, choose JDK 21 (or another version supported by the generated Gradle wrapper).
4. In Android Studio, select **Build → Build Bundle(s) / APK(s) → Build APK(s)**. The debug APK is written to `android/app/build/outputs/apk/debug/app-debug.apk`.
5. Install and test the APK on an emulator or Android device. Verify authentication, screen layouts, navigation, and the launcher icon.

After changing frontend code or environment values, repeat `npm run build` and `npx cap sync android` before building another APK. Native Google sign-in opens the provider in the system browser and returns to the app through the `com.kevkyle.energeia://auth/callback` deep link. Add this exact URL to Supabase **Authentication → URL Configuration → Redirect URLs**. Keep the Google OAuth provider's authorized redirect URI set to the Supabase callback URL (`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`). Test the sign-in and return-to-app flow on a device.

### Create a signed release APK

For distribution, choose **Build → Generate Signed Bundle / APK → APK** in Android Studio and create or select a signing key. Keep the keystore and its passwords backed up securely; do not commit them to the repository. Test the signed APK before sharing or publishing it. The Vercel deployment described below remains the web version, not an APK distribution.

## Calculations and business rules

### Appliance estimate

For each active appliance, the estimated monthly energy use is:

```text
monthly kWh = wattage (W) * quantity * hours per day * 30 / 1000
```

The result is rounded to one decimal place. Estimated monthly cost per appliance is `monthly kWh * household rate per kWh`, rounded to the nearest whole currency unit in the displayed estimate. The dashboard totals the per-appliance estimates.

These are estimates based on the entered rated wattage and daily runtime. They are not measurements of actual device consumption.

### Bills and meter readings

- A bill stores its billing-period dates, consumption, rate, estimated amount, and an optional actual amount.
- The database derives bill status: no actual amount means `estimated`; a recorded actual amount means `actual`.
- The estimated bill amount is calculated in the interface as `consumption kWh * rate per kWh`, rounded to a whole unit.
- A household can have one bill per exact start/end date pair.
- A household can have one daily reading per date. Saving another reading for the same date updates that entry.
- Reading costs are optional. When an entry does not include a cost, summary views estimate it using the applicable household rate.

### Historical summaries

- Monthly charts cover the latest 12 calendar months.
- Bills are grouped by their billing-period end date. If a month has one or more bills, the monthly series sums those bills and does not add that month's daily readings. Otherwise it sums the daily readings for the month.
- For a bill with no actual amount, the historical cost series uses its estimated amount; otherwise it uses the actual amount.
- The weekly dashboard series covers the latest seven days of daily readings.
- These charts summarize records already entered; they do not forecast future usage.

### Recommendations

Insights are generated in the frontend from appliance records. For each appliance used more than one hour per day, the app estimates savings from reducing its runtime by one hour:

```text
suggested monthly kWh savings =
  wattage * quantity * min(1, hours per day - 1) * 30 / 1000
```

The result is rounded to a whole kWh. Impact is labeled high at 25 kWh or more, medium at 10-24 kWh, and low below 10 kWh. Estimated cost savings use the household rate. Dismissal is saved per user and household.

The insights are simple heuristics, not machine-learning predictions or personalized engineering recommendations. The insights screen also displays an annual CO2 reduction estimate using a hard-coded factor of `0.54 kg per kWh`; treat this as an illustrative application assumption, not a verified or configurable emissions factor.

### Scenarios

Scenario calculations substitute adjusted hours per day for the selected appliances, then reuse the appliance monthly-usage formula. They compare the result with the current appliance estimate and apply the configured household rate for an estimated cost impact. Saving or loading a scenario does not modify the underlying appliance runtimes.

## Data model

The initial schema is defined in [`backend/supabase/migrations/202611050001_initial_schema.sql`](./backend/supabase/migrations/202611050001_initial_schema.sql).

| Table | Purpose and main relationships |
| --- | --- |
| `profiles` | User-specific profile details, currency, and notification preferences. Its primary key references the Supabase Auth user. |
| `households` | Household name, occupant count, property and location details, provider/meter identifiers, billing-cycle day, electricity rate, and rate metadata. Records the creating auth user. |
| `household_members` | Associates auth users with households and an `owner` or `member` role. The primary key is the household/user pair. |
| `appliances` | Household appliances, including brand, category, wattage, quantity, hours per day, and optional archive timestamp. |
| `appliance_schedules` | Schedule label, days, start/end time, and enabled state, linked to an appliance. These are stored schedule descriptions; they do not control physical devices. |
| `bills` | Household billing periods, kWh, rate, estimated amount, optional actual amount, and generated status. Duplicate exact periods are prevented per household. |
| `energy_readings` | Dated household consumption, optional cost and notes, source label, and creating user. A household/date pair is unique. |
| `scenarios` | Named household what-if plans, notes, and JSON mapping of appliance IDs to adjusted runtime hours. |
| `dismissed_insights` | Per-user, per-household record of dismissed insight keys. |

The schema also defines helper functions for membership and ownership checks, a `create_household` RPC, a `save_household_appliance` RPC, a new-auth-user trigger, indexes for household/date lookups, and update timestamps for selected tables.

## Authentication and data security

- Supabase Auth handles email/password and Google OAuth sessions.
- The browser uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the Supabase public/publishable key). Never expose a Supabase service-role key in the frontend or commit credentials.
- RLS is enabled on all application tables in the initial migration.
- Profiles are restricted to their owner. Household data is generally accessible to authenticated members of that household; household updates and deletion are owner-only.
- Household appliance, schedule, bill, reading, and scenario policies verify membership. Readings and scenarios also associate writes with the authenticated user. Dismissed insights are user-specific.
- The database applies data constraints such as valid non-negative rates/amounts, positive appliance wattage and quantity, runtime from 0 to 24 hours, valid billing periods, and bounded household/appliance names.
- The schema supports household member roles, but the current interface does not provide a member invitation or management workflow.

## Repository layout

```text
.
|-- backend/
|   `-- supabase/
|       |-- config.toml
|       `-- migrations/       # Versioned PostgreSQL schema and RLS
|-- frontend/
|   |-- public/               # Static assets
|   `-- src/
|       |-- api/              # Supabase client
|       |-- components/       # Shared layout, forms, charts, and UI
|       |-- lib/              # Auth/data contexts, energy calculations, utilities
|       `-- pages/             # Route-level screens
|-- .env.example
|-- package.json
`-- vercel.json
```

## Local development

### Requirements

- Node.js and npm compatible with the Vite version in `package.json`.
- A Supabase project for authentication and persistent application data.

### Install and configure

1. Install dependencies from the repository root:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` in the repository root and fill in the project's values:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

3. Apply the database migration. With the Supabase CLI installed and authenticated:

   ```bash
   cd backend
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

   Alternatively, run the migration SQL in the Supabase SQL Editor.

4. In Supabase Authentication settings, enable Email for password-based sign-in. Google sign-in is optional; if enabled, configure its OAuth credentials and add the Supabase callback URL (`https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`) to the OAuth provider's allowed redirect URIs.
5. In Supabase Authentication URL Configuration, allow the local and deployed app URLs as redirects, including `http://localhost:5173/overview` and `https://YOUR_DOMAIN/overview`.

### Start the app

```bash
npm run dev
```

Open `http://localhost:5173`. Without Supabase environment variables, the landing page can be viewed, but authentication and household data require a configured Supabase project.

## Build, checks, and deployment

Available root scripts:

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

For Vercel, import the repository with its root as the project root and configure:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `frontend/dist`
- Install command: `npm install`
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

`vercel.json` rewrites browser routes to the Vite `index.html` entry point so client-side routes work when opened directly.

## Current scope and limitations

- Meter readings, bills, appliance data, and rates are entered by users; there is no live smart-meter, utility-provider, or billing-system integration.
- Appliance usage and bill costs are estimates derived from user-provided inputs. Actual consumption and actual bill amounts must be recorded separately.
- Schedules are descriptive data for display and planning; Energeia does not switch appliances on or off.
- Recommendations use fixed rules and the CO2 display uses a fixed illustrative factor. They are not forecasts or professional energy audits.
- Notification preferences can be stored, but this repository does not implement a notification delivery service.
- The schema supports `manual`, `meter`, and `import` reading source labels, while the current reading form is a manual-entry workflow.
