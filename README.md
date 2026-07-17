<<<<<<< HEAD
# SharedLab-EquipmentBookingSystem_Frontend
=======
# Lab & Equipment Booking — Frontend

Angular **22** (standalone components, zoneless, Signals), TypeScript
(strict), Tailwind CSS v4, Angular Router with guards, `HttpClient` +
functional interceptors, `@ngx-translate/core`, and Vitest — same
architecture as the [angular-base-starter](../angular-base-starter-main),
carrying over this project's own business logic (auth against the real
backend, users with roles, i18n vi/en, FullCalendar for the booking UI).

## Quick start

```bash
npm install
npm start          # http://localhost:4200
```

Log in with an account issued by the backend, then open **Users**.

## Scripts

| Script | Purpose |
|---|---|
| `npm start` | Dev server (`ng serve`) at :4200 |
| `npm run build` | Production build to `dist/frontend/browser` |
| `npm run build:prod` | Same, explicit production configuration |
| `npm run watch` | Rebuild on change (development config) |
| `npm test` | Vitest via `ng test` |
| `npm run format` / `format:check` | Prettier |

## Architecture

Standalone components throughout — **no NgModules**. State is held in
**Signals-based store services**; UI reads signals directly and Angular's
change detection reacts automatically. No `zone.js`.

### Folder structure

```
src/
├── environments/               # environment.ts (prod) + .development.ts
├── styles.css                  # Tailwind entry + design tokens
└── app/
    ├── app.ts                  # Root component (<router-outlet/>)
    ├── app.config.ts           # Providers: router, HttpClient+interceptors,
    │                           #   translate, app-initializer (locale)
    ├── app.routes.ts           # Lazy routes + guards
    ├── core/                   # App-wide singletons
    │   ├── config/env.ts       # Typed re-export of the active environment
    │   ├── auth/               # token-storage, auth.service (real API),
    │   │                       #   auth.store (signals), auth.guard, types
    │   └── http/               # auth.interceptor, error.interceptor, ApiError
    ├── shared/
    │   ├── ui/                 # ButtonComponent, CardComponent, SpinnerComponent
    │   └── layout/              # AppLayoutComponent (nav, lang, logout)
    └── features/
        ├── home/               # HomePage
        ├── auth/               # LoginPage
        ├── not-found/          # NotFoundPage
        └── users/              # service, signal store, list page, form dialog
```

### State management

State lives in `@Injectable({ providedIn: 'root' })` services that expose
`signal`/`computed` values and async methods — the native-Signals
equivalent of an NgRx SignalStore. See `core/auth/auth.store.ts` and
`features/users/users.store.ts`.

### HTTP layer (`core/http/`)

Two functional interceptors registered in `app.config.ts`:

- `authInterceptor` — attaches `Authorization: Bearer <token>` to requests
  targeting `env.apiBaseUrl`.
- `errorInterceptor` — on `401` clears the session and routes to
  `/auth/login`; normalizes every failure to an **`ApiError`**
  (`status`, `message`, `code`, `details`).

### Auth & guards

`core/auth/auth.guard.ts` exports `authGuard` (protects `/users`, redirects
to `/auth/login?redirect=…`) and `guestGuard` (keeps signed-in users off
`/auth/login`). `core/auth/auth.service.ts` calls the real backend
(`POST {apiBaseUrl}/auth/login`); `AuthStore` owns the session
side-effects (token storage, current-user signal, `roles`).

### i18n

`@ngx-translate/core` (v18, function-based providers) with the HTTP loader
reading `public/i18n/{lang}.json` (copied to the site root at build time).
Default locale is `vi`. `app.config.ts` uses `provideAppInitializer` to
load the initial locale before first paint.

### Styling

Tailwind v4 via PostCSS (`.postcssrc.json` → `@tailwindcss/postcss`). The
global entry is `src/styles.css`; design tokens (brand palette, surface
colors, card radius/shadow) live in the `@theme` block.

## Testing

Angular 22's `@angular/build:unit-test` builder runs **Vitest**. Examples:
`src/app/app.spec.ts`, `src/app/shared/ui/button.spec.ts`. Run `npm test`.

## Configuration

Swapped by `fileReplacements` in `angular.json` (dev build uses
`environment.development.ts`). Access via `core/config/env.ts`.

| Field | Dev | Prod |
|---|---|---|
| `apiBaseUrl` | `https://localhost:7080/api` | `https://api.example.com/api` |
| `defaultLocale` | `vi` | `vi` |
| `supportedLocales` | `['vi','en']` | `['vi','en']` |

## Docker

```bash
docker build -t lab-booking-frontend .
docker run -p 8080:80 lab-booking-frontend
```

Multi-stage build (Node → nginx). Build output is `dist/frontend/browser`
(Angular application builder), which the Dockerfile copies into nginx.
>>>>>>> feature-2
