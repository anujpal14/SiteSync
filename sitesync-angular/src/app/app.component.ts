// src/app/app.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from './shared/components/ui.components';
import { AuthService } from './core/services/auth.service';
import { ROLE_PERMISSIONS } from './core/models/auth.models';


interface NavItem {
  path: string;
  label: string;
  icon: string;
  routeKey:string;
  badge?: number;
}
  type Role = 'Admin' | 'Supervisor' | 'Labour';

@Component({
  selector: 'ss-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sb-logo">
          <div class="logo-icon">SS</div>
          <div class="logo-text">Site<span>Sync</span></div>
        </div>

        <nav class="nav-section">
          <div class="nav-label">Main</div>
          @for (item of visibleMainNav(); track item.path) {
            <a class="nav-item" [routerLink]="item.path" routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: item.path === '/'}">
              <span class="nav-icon material-icon">{{ item.icon }}</span>
              <span class="nav-label-text">{{ item.label }}</span>
              @if (item.badge) {
                <span class="nav-badge">{{ item.badge }}</span>
              }
            </a>
          }
        </nav>
@if (visibleInsightNav().length > 0) {

        <nav class="nav-section" style="margin-top:14px">
          <div class="nav-label">Insights</div>
          

          @for (item of visibleInsightNav(); track item.path) {

            <a class="nav-item" [routerLink]="item.path" routerLinkActive="active">
              <span class="nav-icon material-icon">{{ item.icon }}</span>
              <span class="nav-label-text">{{ item.label }}</span>
            </a>
          }
        </nav>

}
<div class="role-badge-wrap">
<div class="role-badge"
[style.background]="roleBadgeColor() + '18'"
[style.color]="roleBadgeColor()"
[style.border-color]="roleBadgeColor() + '40'">
<span class="material-icon" style="font-size:13px!important">{{ roleIcon() }}</span>
{{ auth.role() }}
</div>
</div>



        <div class="sb-footer">
          <div class="user-card">
  <div class="user-av">{{ userInitials() }}</div>

 <div class="user-info">

    <div class="u-name">{{ auth.fullName() }}</div>
    <div class="u-role">{{ auth.role() }} · Contractor</div>
  </div>
  <button class="logout-btn" (click)="logout()" title="Sign out">
<span class="material-icon">logout</span>
</button>

</div>
        </div>
      </aside>

      <!-- MAIN -->
      <div class="main-wrap">
        <!-- TOPBAR -->
        <header class="topbar">
          <div>
            <div class="tb-title">{{ pageTitle() }}</div>
            <div class="tb-sub">{{ pageSub() }}</div>
          </div>
          <div class="tb-right">
            <div class="search-bar">
              <span class="material-icon" style="font-size:15px;color:var(--muted)">search</span>
              <input type="text" placeholder="Search sites, clients…" (keydown.enter)="onSearch($event)"/>
            </div>
            <div class="icon-btn" title="Notifications">
              <span class="material-icon">notifications</span>
              <div class="notif-dot"></div>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <!-- TOAST -->
    @if (toast()) {
      <div class="toast show">
        <div class="toast-dot" [style.background]="toast()!.color"></div>
        <span>{{ toast()!.message }}</span>
      </div>
    }
  `,
  styles: [`
    /* SHELL */
    .shell { display:flex; min-height:100vh; }

    /* SIDEBAR */
    .sidebar { width:232px; min-height:100vh; background:var(--surface);
      border-right:0.5px solid var(--border); display:flex; flex-direction:column;
      padding:24px 0; position:fixed; top:0; left:0; bottom:0; z-index:100; }
    .sb-logo { padding:0 20px 22px; border-bottom:0.5px solid var(--border); margin-bottom:16px;
      display:flex; align-items:center; gap:10px; }
    .logo-icon { width:34px; height:34px; background:var(--accent); border-radius:9px;
      display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif;
      font-weight:800; font-size:14px; color:#fff; }
    .logo-text { font-family:'Syne',sans-serif; font-weight:700; font-size:17px; color:var(--text); }
    .logo-text span { color:var(--accent); }

    .nav-section { padding:0 10px; margin-bottom:4px; }
    .nav-label { font-size:9.5px; font-weight:500; letter-spacing:1.6px; color:var(--muted2);
      text-transform:uppercase; padding:0 10px; margin-bottom:5px; }
    .nav-item { display:flex; align-items:center; gap:11px; padding:9px 10px;
      border-radius:9px; color:var(--muted); font-size:13px; text-decoration:none;
      transition:all .15s; border:0.5px solid transparent; margin-bottom:2px; }
    .nav-item:hover { background:var(--surface2); color:var(--text); }
    .nav-item.active { background:rgba(108,99,255,.13); color:var(--accent); border-color:rgba(108,99,255,.22); }
    .nav-icon { width:18px; height:18px; display:flex; align-items:center; justify-content:center;
      flex-shrink:0; font-size:16px !important; }
    .nav-label-text { flex:1; }
    .nav-badge { background:var(--red); color:#fff; font-size:9.5px; font-weight:600;
      padding:2px 6px; border-radius:20px; margin-left:auto; }
   
.role-badge-wrap { padding:12px 20px 0; margin-top:auto; }
.role-badge { display:flex; align-items:center; justify-content:center; gap:6px;
padding:7px 12px; border-radius:20px; border:0.5px solid;
font-size:11.5px; font-weight:500; }
.sb-footer { padding:12px 20px 0; border-top:0.5px solid var(--border); margin-top:10px; }
.user-card { display:flex; align-items:center; gap:9px; padding:9px; border-radius:9px; }





    .user-card:hover { background:var(--surface2); }
    .user-av { width:34px; height:34px; border-radius:50%; flex-shrink:0;

      background:linear-gradient(135deg,var(--accent),#4ecdc4);
      display:flex; align-items:center; justify-content:center;
      font-family:'Syne',sans-serif; font-weight:700; font-size:12px; color:#fff; }
   .user-info { flex:1; min-width:0; }
.u-name { font-size:12.5px; font-weight:500; color:var(--text);
white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

    .u-role { font-size:10.5px; color:var(--muted); }


    .logout-btn { background:none; border:none; cursor:pointer; padding:5px;
border-radius:6px; display:flex; align-items:center; justify-content:center;
color:var(--muted); transition:color .15s, background .15s; flex-shrink:0; }
.logout-btn:hover { color:#ff6b6b; background:rgba(255,107,107,.1); }
.logout-btn .material-icon { font-size:17px !important; }


    /* MAIN */
    .main-wrap { margin-left:232px; flex:1; display:flex; flex-direction:column; }
    .topbar { height:60px; background:var(--surface); border-bottom:0.5px solid var(--border);
      display:flex; align-items:center; padding:0 28px; gap:14px;
      position:sticky; top:0; z-index:50; }

      .tb-title { font-family:'Syne',sans-serif; font-weight:700; font-size:17px;
letter-spacing:-.5px; color:var(--text); }

    .tb-sub { font-size:11px; color:var(--muted); margin-top:1px; }
    .tb-right { margin-left:auto; display:flex; align-items:center; gap:10px; }
    .search-bar { display:flex; align-items:center; gap:7px; background:var(--surface2);
      border:0.5px solid var(--border); border-radius:8px; padding:6px 12px; width:200px; }
    .search-bar:focus-within { border-color:var(--accent); }
    .search-bar input { background:none; border:none; outline:none; color:var(--text); font-size:12.5px; width:100%; }
    .search-bar input::placeholder { color:var(--muted); }
    .icon-btn { width:34px; height:34px; background:var(--surface2); border:0.5px solid var(--border);
     

     border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; }

    .icon-btn .material-icon { font-size:17px; color:var(--muted); }
    .notif-dot { position:absolute; top:6px; right:6px; width:6px; height:6px;
      background:var(--red); border-radius:50%; border:1.5px solid var(--surface); }
    .page-content { flex:1; padding:28px; }

    /* TOAST */
    .toast { position:fixed; bottom:28px; right:28px; background:var(--surface3);
      border:0.5px solid var(--border2); border-radius:9px; padding:13px 18px;
      font-size:13px; color:var(--text); z-index:999; display:flex; align-items:center;
      gap:9px; min-width:220px; animation:toastIn .3s ease; }
    @keyframes toastIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .toast-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
    .material-icon { font-family:'Material Symbols Outlined'; font-style:normal; }
    
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  private toastSvc = inject(ToastService);
    auth             = inject(AuthService);
private sub?:    Subscription;
toast     = signal<Toast | null>(null);
pageTitle = signal('Dashboard');
pageSub   = signal('Overview across all sites');
// ── All nav definitions — includes routeKey for permission lookup ──
private readonly allMainNav: NavItem[] = [
{ path: '/',        label: 'Dashboard', icon: 'grid_view',              routeKey: 'dashboard' },
{ path: '/sites',   label: 'Sites',     icon: 'home_work',              routeKey: 'sites', badge: 8 },
{ path: '/clients', label: 'Clients',   icon: 'people',                 routeKey: 'clients'   },
{ path: '/labour',  label: 'Labour',    icon: 'engineering',            routeKey: 'labour'    },
{ path: '/finance', label: 'Finance',   icon: 'account_balance_wallet', routeKey: 'finance'   },
];
private readonly allInsightNav: NavItem[] = [
{ path: '/analytics', label: 'Analytics', icon: 'bar_chart', routeKey: 'analytics' },
{ path: '/settings',  label: 'Settings',  icon: 'settings',  routeKey: 'settings'  },
];
// ── Computed filtered navs — react automatically when role changes ──
visibleMainNav = computed(() => {
const role = this.auth.role();
if (!role) return [];
const allowed = ROLE_PERMISSIONS[role];
return this.allMainNav.filter(item => allowed.includes(item.routeKey));
});
visibleInsightNav = computed(() => {
const role = this.auth.role();
if (!role) return [];
const allowed = ROLE_PERMISSIONS[role];
return this.allInsightNav.filter(item => allowed.includes(item.routeKey));
});
// ── User display ──────────────────────────────────────────────────
userInitials = computed(() =>
             
    this.auth.fullName()
      .split(' ')
      .map(w => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2)
  );



 roleBadgeColor = computed(() => {
  const role = this.auth.role() as Role | null;

  const map: Record<Role, string> = {
    Admin: '#6c63ff',
    Supervisor: '#4ecdc4',
    Labour: '#43e8a0',
  };

  return role ? map[role] : '#8a899a';
});

roleIcon = computed(() => {
  const role = this.auth.role() as Role | null;

  const map: Record<Role, string> = {
    Admin: 'admin_panel_settings',
    Supervisor: 'supervisor_account',
    Labour: 'engineering',
  };

  return role ? map[role] : 'person';
});
// ── Page meta ─────────────────────────────────────────────────────

  
  readonly pageMeta: Record<string, { title: string; sub: string }> = {
    '/':          { title: 'Dashboard', sub: 'Overview across all sites' },
    '/sites':     { title: 'Sites',     sub: 'Manage all project locations' },
    '/clients':   { title: 'Clients',   sub: 'All your client relationships' },
    '/labour':    { title: 'Labour',    sub: 'Workers, attendance & wages' },
    '/finance':   { title: 'Finance',   sub: 'Budgets, invoices & payments' },
    '/analytics': { title: 'Analytics', sub: 'Performance across all sites' },
    '/settings':  { title: 'Settings',  sub: 'Platform preferences' },
  };

  logout() { this.auth.logout(); }


  ngOnInit() {
    this.sub = this.toastSvc.toast$.subscribe(t => {
      this.toast.set(t);
      setTimeout(() => this.toast.set(null), 3000);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  onSearch(e: Event) {
    const q = (e.target as HTMLInputElement).value.trim();
    if (q) console.log('Search:', q);
  }

  
}
