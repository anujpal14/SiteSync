import { Routes } from "@angular/router";
import { authGuard } from "./core/guard/auth.guard";
import { roleGuard } from "./core/guard/role.guard";

export const routes: Routes = [
  // ── Public — no shell, no sidebar ─────────────────────
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then((m) => m.Login),
  },

  // ── Protected — inside shell (sidebar + topbar) ────────
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () =>
      import("./layout/shell/shell.component").then((m) => m.ShellComponent),
    children: [
      {
        path: "",
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: "sites",
        canActivate: [roleGuard],
        data: { roles: ["Admin", "Supervisor"] },
        loadComponent: () =>
          import("./features/sites/sites.component").then(
            (m) => m.SitesComponent,
          ),
      },
      {
        path: "clients",
        canActivate: [roleGuard],
        data: { roles: ["Admin"] },
        loadComponent: () =>
          import("./features/clients/clients.component").then(
            (m) => m.ClientsComponent,
          ),
      },
      {
        path: "labour",
        canActivate: [roleGuard],
        data: { roles: ["Admin", "Supervisor", "Labour"] },
        loadComponent: () =>
          import("./features/labour/labour.component").then(
            (m) => m.LabourComponent,
          ),
      },
      {
        path: "finance",
        canActivate: [roleGuard],
        data: { roles: ["Admin"] },
        loadComponent: () =>
          import("./features/finance/finance.component").then(
            (m) => m.FinanceComponent,
          ),
      },
      {
        path: "reports",
        canActivate: [authGuard, roleGuard],
        data: { roles: ["Admin", "Supervisor"] },
        loadComponent: () =>
          import("./features/reports/reports.component").then(
            (m) => m.ReportsComponent,
          ),
      },
      {
        path: "analytics",
        canActivate: [roleGuard],
        data: { roles: ["Admin", "Supervisor"] },
        loadComponent: () =>
          import("./features/analytics/analytics.component").then(
            (m) => m.AnalyticsComponent,
          ),
      },
      {
        path: "settings",
        canActivate: [roleGuard],
        data: { roles: ["Admin"] },
        loadComponent: () =>
          import("./features/settings/settings.component").then(
            (m) => m.SettingsComponent,
          ),
      },
    ],
  },

  { path: "**", redirectTo: "" },
];
