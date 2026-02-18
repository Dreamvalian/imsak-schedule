## Ramadhan Time Companion

Ramadhan Time Companion is a minimal, focused web app that keeps your Suhoor and Iftar schedule perfectly in sync throughout Ramadan. It automatically detects your location, fetches accurate prayer times, and highlights Imsak, Fajr, and Maghrib with a live countdown.

### Features

- Automatic geolocation with graceful fallback to manual location settings
- Daily schedule with Imsak, Fajr, and Maghrib (Iftar) times
- Imsak time calculated as Fajr minus a configurable offset
- Monthly Ramadan calendar view with per‑day timings
- Next-event countdown (Imsak or Iftar) with real-time updates
- Dark-mode first UI with clean, distraction-free layout

### Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- SWR for data fetching
- Zod for runtime validation
- MuslimSalat API as the primary data source
- Aladhan API as a fallback

### Getting Started

#### Prerequisites

- Node.js 18 or newer
- npm (comes with Node.js)

#### Installation

```bash
npm install
```

#### Environment Variables

Create a file named `.env.local` in the project root:

```bash
MUSLIMSALAT_API_KEY=#
```

You can replace the value with your own key from https://muslimsalat.com/api/.

#### Development

Start the dev server:

```bash
npm run dev
```

Then open the app in your browser:

- http://localhost:3000

The app will attempt to detect your location. If the browser blocks geolocation, you can manually adjust your location and preferences from the Settings panel.

#### Linting

Run ESLint:

```bash
npm run lint
```

### Key Behavior

- The backend API route `/api/prayer-calendar`:
  - Validates query parameters (latitude, longitude, calculation method, and Imsak offset)
  - Fetches a monthly schedule from MuslimSalat using your API key
  - Falls back to Aladhan’s calendar API if MuslimSalat fails or is unavailable
  - Computes Imsak based on the configured offset from Fajr

### Production Notes

- Ensure `MUSLIMSALAT_API_KEY` is configured in your hosting provider’s environment settings.
- Build the app with:

```bash
npm run build
```

and run it with:

```bash
npm start
```

Any platform that supports Node.js and Next.js (such as Vercel) can host this app.

