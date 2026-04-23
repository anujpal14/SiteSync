import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
} from "@angular/core";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";

import { ToastService, Toast } from "../../shared/components/ui.components";
import { AuthService } from "../../core/services/auth.service";
import { ROLE_PERMISSIONS } from "../../core/models/auth.models";
import { ConfirmModalComponent } from "@shared/components/confirm-modal.component";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  routeKey: string;
  badge?: number;
}

type Role = "Admin" | "Supervisor" | "Labour";

@Component({
  selector: "ss-shell",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    ConfirmModalComponent,
  ],
  templateUrl: "./shell.component.html",
  styleUrl: "./shell.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit, OnDestroy {
  private toastSvc = inject(ToastService);
  auth = inject(AuthService);
  private sub?: Subscription;

  toast = signal<Toast | null>(null);
  pageTitle = signal("Dashboard");
  pageSub = signal("Overview across all sites");

  isSidebarOpen = signal(false);

  private readonly allMainNav: NavItem[] = [
    { path: "/", label: "Dashboard", icon: "grid_view", routeKey: "dashboard" },
    {
      path: "/sites",
      label: "Sites",
      icon: "home_work",
      routeKey: "sites",
      badge: 8,
    },
    { path: "/clients", label: "Clients", icon: "people", routeKey: "clients" },
    {
      path: "/labour",
      label: "Labour",
      icon: "engineering",
      routeKey: "labour",
    },
    {
      path: "/finance",
      label: "Finance",
      icon: "account_balance_wallet",
      routeKey: "finance",
    },
  ];

  private readonly allInsightNav: NavItem[] = [
    {
      path: "/analytics",
      label: "Analytics",
      icon: "bar_chart",
      routeKey: "analytics",
    },
    {
      path: "/reports",
      label: "Reports",
      icon: "description",
      routeKey: "reports",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: "settings",
      routeKey: "settings",
    },
  ];

  visibleMainNav = computed(() => {
    const role = this.auth.role();
    if (!role) return [];
    const allowed = ROLE_PERMISSIONS[role];
    return this.allMainNav.filter((item) => allowed.includes(item.routeKey));
  });

  visibleInsightNav = computed(() => {
    const role = this.auth.role();
    if (!role) return [];
    const allowed = ROLE_PERMISSIONS[role];
    return this.allInsightNav.filter((item) => allowed.includes(item.routeKey));
  });

  userInitials = computed(() =>
    this.auth
      .fullName()
      .split(" ")
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2),
  );

  roleBadgeColor = computed(() => {
    const map: Record<Role, string> = {
      Admin: "#6c63ff",
      Supervisor: "#4ecdc4",
      Labour: "#43e8a0",
    };
    const role = this.auth.role() as Role | null;
    return role ? map[role] : "#8a899a";
  });

  roleIcon = computed(() => {
    const map: Record<Role, string> = {
      Admin: "admin_panel_settings",
      Supervisor: "supervisor_account",
      Labour: "engineering",
    };
    const role = this.auth.role() as Role | null;
    return role ? map[role] : "person";
  });

  // ── Page meta ─────────────────────────────────────────────────────
  readonly pageMeta: Record<string, { title: string; sub: string }> = {
    "/": { title: "Dashboard", sub: "Overview across all sites" },
    "/sites": { title: "Sites", sub: "Manage all project locations" },
    "/clients": { title: "Clients", sub: "All your client relationships" },
    "/labour": { title: "Labour", sub: "Workers, attendance & wages" },
    "/finance": { title: "Finance", sub: "Budgets, invoices & payments" },
    "/analytics": { title: "Analytics", sub: "Performance across all sites" },
    // REPORTS META ADDED HERE
    "/reports": { title: "Reports", sub: "Generate and download PDF reports" },
    "/settings": { title: "Settings", sub: "Platform preferences" },
  };

  // MISSING METHODS RESTORED: Mobile toggle methods required by HTML
  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen.set(false);
    }
  }

  logout() {
    this.auth.logout();
  }

  ngOnInit() {
    this.sub = this.toastSvc.toast$.subscribe((t) => {
      this.toast.set(t);
      setTimeout(() => this.toast.set(null), 3000);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value.trim();
    if (q) console.log("Search:", q);
  }
}
