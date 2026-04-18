# SiteSync Angular 21 Frontend

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone components) |
| State | Angular Signals (`signal`, `computed`) |
| HTTP | Angular `HttpClient` + functional interceptors |
| Routing | `@angular/router` with lazy-loaded routes + View Transitions |
| Forms | Angular Reactive Forms |
| Styling | SCSS + CSS custom properties (dark theme) |
| Icons | Google Material Symbols |
| Fonts | Syne (headings) + DM Sans (body) |

---

## Project Structure

```
src/
├── main.ts                              ← Bootstrap (standalone)
├── index.html
├── styles.scss                          ← Global dark theme tokens
└── app/
    ├── app.component.ts                 ← Shell: sidebar + topbar + toast
    ├── app.config.ts                    ← provideRouter, provideHttpClient
    ├── app.routes.ts                    ← Lazy-loaded routes
    ├── core/
    │   └── interceptors/
    │       └── api.interceptor.ts       ← Functional HTTP interceptor
    ├── data/
    │   ├── models/models.ts             ← All TS interfaces (mirrors .NET DTOs)
    │   └── services/api.service.ts      ← DashboardService, SiteService, etc.
    ├── shared/
    │   ├── pipes/format.pipe.ts         ← inrFormat, ssDate, initials pipes
    │   └── components/ui.components.ts  ← PillComponent, KpiCard, Avatar, Modal, Toast
    └── features/
        ├── dashboard/dashboard.component.ts   ← KPIs, charts, activity
        ├── sites/sites.component.ts           ← Table, filter, add, delete
        ├── clients/clients.component.ts       ← Directory, add, delete
        ├── labour/labour.component.ts         ← Workers + attendance toggle
        ├── finance/finance.component.ts       ← Invoices, mark paid
        ├── analytics/analytics.component.ts   ← Charts, breakdowns
        └── settings/settings.component.ts     ← Profile, company, notifs, roles
```

---

## Setup & Run

### Prerequisites
```bash
node --version   # 20+
npm --version    # 10+
```

### 1. Install dependencies
```bash
cd sitesync-angular
npm install
```

### 2. Make sure your .NET API is running
```bash
cd SiteSync.API
dotnet run
# Runs at http://localhost:5000
```

### 3. Start Angular dev server
```bash
npm start
# Runs at http://localhost:4200
# API calls proxied to http://localhost:5000 via proxy.conf.json
```

### 4. Production build
```bash
npm run build:prod
# Output in dist/sitesync/
# Drop into wwwroot of your .NET API to serve together
```

---

## API Proxy (Development)

`proxy.conf.json` maps `/api/*` → `http://localhost:5000/api/*`  
So Angular calls `/api/dashboard` and the proxy forwards it to the .NET backend.  
In production, Angular and .NET are served from the same origin — no proxy needed.

---

## Angular 21 Features Used

| Feature | Where |
|---|---|
| Standalone components | Every component — no NgModules |
| Signals (`signal`, `computed`) | All state in feature components |
| `@if`, `@for`, `@switch` | All templates — new control flow syntax |
| Functional HTTP interceptor | `api.interceptor.ts` |
| `provideHttpClient(withFetch())` | `app.config.ts` — uses Fetch API |
| `withViewTransitions()` | Smooth page transitions on route change |
| Lazy-loaded routes | Each feature loaded on demand |
| `inject()` function | Used everywhere — no constructor DI |
| `OnPush` change detection | All components for performance |
| Reactive Forms | All forms with validation |

---

## API Endpoints Consumed

| Service | Method | Endpoint |
|---|---|---|
| DashboardService | GET | `/api/dashboard` |
| SiteService | GET | `/api/sites?status=active` |
| SiteService | POST | `/api/sites` |
| SiteService | PATCH | `/api/sites/:id/progress` |
| SiteService | DELETE | `/api/sites/:id` |
| ClientService | GET | `/api/clients` |
| ClientService | POST | `/api/clients` |
| ClientService | DELETE | `/api/clients/:id` |
| WorkerService | GET | `/api/workers` |
| WorkerService | POST | `/api/workers` |
| WorkerService | DELETE | `/api/workers/:id` |
| AttendanceService | POST | `/api/attendance` (MERGE upsert) |
| InvoiceService | GET | `/api/invoices?status=pending` |
| InvoiceService | POST | `/api/invoices` |
| InvoiceService | PATCH | `/api/invoices/:id/status` |

---

## Deploying to Production with .NET API

1. Build Angular: `npm run build:prod`
2. Copy `dist/sitesync/browser/*` into `SiteSync.API/wwwroot/`
3. Add in `Program.cs`:
```csharp
app.UseDefaultFiles();
app.UseStaticFiles();
// After MapControllers():
app.MapFallbackToFile("index.html");
```
4. Angular routing works — all `/sites`, `/clients` etc. fall back to `index.html`

---

## Next Steps
- JWT Auth guard (`canActivate`) + login screen
- `HttpContext` token for auth headers
- Angular PWA (`@angular/pwa`) for offline support
- Unit tests with Jasmine + Angular Testing Utilities
- Deploy to Azure Static Web Apps + Azure App Service (API)
