// src/app/features/dashboard/dashboard.component.ts
import {
  Component, OnInit, inject, signal,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../data/services/api.service';
import { DashboardStats } from '../../data/models/models';
import {
  KpiCardComponent, AvatarComponent, PillComponent,
  ProgressBarComponent, EmptyStateComponent
} from '../../shared/components/ui.components';
import { InrFormatPipe, avatarColor } from '../../shared/pipes/format.pipe';

@Component({
  selector: 'ss-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, KpiCardComponent, AvatarComponent, PillComponent,
    ProgressBarComponent, InrFormatPipe
  ],
  template: `
    @if (loading()) {
      <div class="loading-grid">
        @for (i of [1,2,3,4]; track i) { <div class="shimmer-card"></div> }
      </div>
    } @else if (error()) {
      <div class="error-state">
        <span style="font-size:36px">⚠️</span>
        <p>{{ error() }}</p>
        <button class="btn-primary" (click)="load()">Retry</button>
      </div>
    } @else if (dash()) {
      <div class="dashboard-wrap">

        <!-- KPI ROW -->
        <div class="kpi-grid">
          <ss-kpi value="{{ dash()!.activeSites }}" label="Active Sites"
            icon="home_work" iconColor="#6c63ff" trend="Live" [trendUp]="true"/>
          <ss-kpi value="{{ dash()!.totalWorkers }}" label="Total Workers"
            icon="engineering" iconColor="#4ecdc4" trend="On field" [trendUp]="true"/>
          <ss-kpi value="{{ dash()!.totalClients }}" label="Total Clients"
            icon="people" iconColor="#43e8a0" trend="Active" [trendUp]="true"/>
          <ss-kpi [value]="dash()!.revenueThisMonth | inrFormat"
            label="Revenue This Month" icon="account_balance_wallet"
            iconColor="#ffa94d" trend="↑ This month" [trendUp]="true"/>
        </div>

        <!-- ATTENDANCE STRIP -->
        <div class="attend-row">
          <div class="attend-chip" style="border-color:rgba(67,232,160,.25);background:rgba(67,232,160,.07)">
            <div class="ac-val" style="color:#43e8a0">{{ dash()!.presentToday }}</div>
            <div class="ac-lbl">Present Today</div>
          </div>
          <div class="attend-chip" style="border-color:rgba(255,107,107,.25);background:rgba(255,107,107,.07)">
            <div class="ac-val" style="color:#ff6b6b">{{ dash()!.absentToday }}</div>
            <div class="ac-lbl">Absent Today</div>
          </div>
          <div class="attend-chip" style="border-color:rgba(255,169,77,.25);background:rgba(255,169,77,.07)">
            <div class="ac-val" style="color:#ffa94d">{{ dash()!.pendingInvoices | inrFormat }}</div>
            <div class="ac-lbl">Pending Invoices</div>
          </div>
          <div class="attend-chip" style="border-color:rgba(108,99,255,.25);background:rgba(108,99,255,.07)">
            <div class="ac-val" style="color:#6c63ff">{{ dash()!.totalBudget | inrFormat }}</div>
            <div class="ac-lbl">Total Budget</div>
          </div>
        </div>

        <!-- MID ROW -->
        <div class="mid-row">
          <!-- Sites Table -->
          <div class="card">
            <div class="card-hd">
              <div class="card-title">Site Overview</div>
              <button class="link-btn" (click)="goto('/sites')">View all →</button>
            </div>
            <table class="ss-table">
              <thead>
                <tr>
                  <th>Site</th><th>City</th><th>Client</th><th>Progress</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (site of dash()!.recentSites; track site.id) {
                  <tr (click)="goto('/sites')">
                    <td>
                      <span class="dot" [style.background]="siteColor(site.status)"></span>
                      {{ site.name }}
                    </td>
                    <td class="muted">{{ site.city }}</td>
                    <td class="muted">{{ site.clientName }}</td>
                    <td><ss-progress [progress]="site.progress" [status]="site.status"/></td>
                    <td><ss-pill [status]="site.status"/></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Activity Feed -->
          <div class="card">
            <div class="card-hd"><div class="card-title">Recent Activity</div></div>
            <div class="activity-list">
              @for (act of dash()!.activities; track act.id) {
                <div class="act-item">
                  <div class="act-icon">{{ act.icon }}</div>
                  <div class="act-body">
                    <div class="act-text">{{ act.action }}</div>
                    <div class="act-time">{{ act.timeAgo }}</div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- BOT ROW -->
        <div class="bot-row">
          <!-- Labour -->
          <div class="card">
            <div class="card-hd">
              <div class="card-title">Labour on Sites</div>
              <button class="link-btn" (click)="goto('/labour')">Manage →</button>
            </div>
            @for (w of dash()!.recentWorkers; track w.id; let i = $index) {
              <div class="mini-item">
                <ss-avatar [name]="w.name" [size]="32" [index]="i" [fontSize]="10"/>
                <div class="mi-info">
                  <div class="mi-name">{{ w.name }}</div>
                  <div class="mi-sub">{{ w.role }} · {{ w.siteName || 'Unassigned' }}</div>
                </div>
                <div class="status-dot" [style.background]="w.todayStatus === 'present' ? '#43e8a0' : '#ff6b6b'"></div>
              </div>
            }
          </div>

          <!-- Finance -->
          <div class="card">
            <div class="card-hd">
              <div class="card-title">Finance Summary</div>
              <button class="link-btn" (click)="goto('/finance')">Details →</button>
            </div>
            <!-- Mini bar chart -->
            <div class="mini-chart">
              @for (r of dash()!.monthlyRevenue; track r.month; let i = $index; let last = $last) {
                <div class="bar-col" [class.hl]="last"
                     [style.height.%]="barHeight(r.revenue)"
                     [title]="r.month + ': ' + (r.revenue | inrFormat)"></div>
              }
            </div>
            <div class="chart-labels">
              @for (r of dash()!.monthlyRevenue; track r.month) {
                <span>{{ r.month }}</span>
              }
            </div>
            <div class="fin-rows">
              @for (row of finRows(); track row.label) {
                <div class="fin-row">
                  <span class="fin-lbl">{{ row.label }}</span>
                  <div class="fin-track">
                    <div class="fin-fill" [style.width.%]="row.pct" [style.background]="row.color"></div>
                  </div>
                  <span class="fin-amt">{{ row.amount }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Clients -->
          <div class="card">
            <div class="card-hd">
              <div class="card-title">Top Clients</div>
              <button class="link-btn" (click)="goto('/clients')">View all →</button>
            </div>
            @for (c of dash()!.topClients; track c.id; let i = $index) {
              <div class="mini-item">
                <ss-avatar [name]="c.name" [size]="32" [index]="i" [rounded]="false" [fontSize]="10"/>
                <div class="mi-info">
                  <div class="mi-name">{{ c.name }}</div>
                  <div class="mi-sub">{{ c.city }} · {{ c.siteCount }} sites</div>
                </div>
                <div class="mi-val">{{ c.totalValue | inrFormat }}</div>
              </div>
            }
          </div>
        </div>

      </div>
    }
  `,
  styles: [`
    .dashboard-wrap { display:flex; flex-direction:column; gap:20px; }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
    .attend-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .attend-chip { padding:14px 16px; border-radius:10px; border-width:0.5px; border-style:solid; }
    .ac-val { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; }
    .ac-lbl { font-size:11px; color:var(--muted); margin-top:3px; }

    .mid-row { display:grid; grid-template-columns:1fr 300px; gap:14px; }
    .bot-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

    .card { background:var(--surface); border:0.5px solid var(--border);
      border-radius:14px; padding:20px; }
    .card-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .card-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; letter-spacing:-.3px; color:var(--text); }
    .link-btn { background:none; border:0.5px solid var(--border); border-radius:7px;
      color:var(--accent); font-size:11.5px; padding:5px 12px; cursor:pointer; }
    .link-btn:hover { background:rgba(108,99,255,.1); }

    /* Table */
    .ss-table { width:100%; border-collapse:collapse; }
    .ss-table th { text-align:left; font-size:10px; font-weight:500; color:var(--muted);
      text-transform:uppercase; letter-spacing:1px; padding:0 0 10px; border-bottom:0.5px solid var(--border); }
    .ss-table td { padding:11px 0; font-size:12.5px; border-bottom:0.5px solid var(--border);
      vertical-align:middle; padding-right:12px; }
    .ss-table tr:last-child td { border-bottom:none; }
    .ss-table tbody tr { cursor:pointer; transition:background .1s; }
    .ss-table tbody tr:hover td { background:rgba(255,255,255,.02); }
    .dot { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:8px; }
    .muted { color:var(--muted) !important; }

    /* Activity */
    .activity-list { display:flex; flex-direction:column; }
    .act-item { display:flex; gap:11px; align-items:flex-start; padding:10px 0;
      border-bottom:0.5px solid var(--border); }
    .act-item:last-child { border-bottom:none; }
    .act-icon { width:30px; height:30px; border-radius:8px; background:rgba(108,99,255,.12);
      display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
    .act-text { font-size:12px; color:var(--text); line-height:1.5; }
    .act-time { font-size:10.5px; color:var(--muted); margin-top:2px; }

    /* Mini items */
    .mini-item { display:flex; align-items:center; gap:9px; padding:9px; background:var(--surface2);
      border-radius:9px; border:0.5px solid var(--border); margin-bottom:8px; }
    .mi-info { flex:1; min-width:0; }
    .mi-name { font-size:12.5px; font-weight:500; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .mi-sub { font-size:10.5px; color:var(--muted); }
    .mi-val { font-size:12.5px; font-weight:500; color:#43e8a0; flex-shrink:0; }
    .status-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }

    /* Mini chart */
    .mini-chart { height:56px; display:flex; align-items:flex-end; gap:3px; margin:14px 0 5px; }
    .bar-col { flex:1; border-radius:2px 2px 0 0; background:rgba(108,99,255,.2);
      cursor:pointer; transition:background .15s; min-height:4px; }
    .bar-col:hover, .bar-col.hl { background:var(--accent); }
    .chart-labels { display:flex; justify-content:space-between; margin-bottom:14px; }
    .chart-labels span { font-size:9.5px; color:var(--muted); flex:1; text-align:center; }
    .fin-rows { display:flex; flex-direction:column; gap:10px; }
    .fin-row { display:flex; align-items:center; gap:10px; }
    .fin-lbl { font-size:12px; color:var(--muted); flex:1; }
    .fin-track { width:90px; height:5px; background:var(--surface2); border-radius:3px; overflow:hidden; }
    .fin-fill { height:100%; border-radius:3px; }
    .fin-amt { font-size:12px; font-weight:500; min-width:56px; text-align:right; color:var(--text); }

    /* Shimmer */
    .loading-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
    .shimmer-card { height:110px; border-radius:14px;
      background:linear-gradient(90deg,var(--surface) 25%,var(--surface2) 50%,var(--surface) 75%);
      background-size:200% 100%; animation:shimmer 1.4s infinite; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .error-state { display:flex; flex-direction:column; align-items:center; gap:12px;
      padding:60px 20px; text-align:center; color:var(--muted); }
    .btn-primary { background:var(--accent); color:#fff; border:none; border-radius:9px;
      padding:10px 20px; font-size:13px; cursor:pointer; }
  `]
})
export class DashboardComponent implements OnInit {
  private svc    = inject(DashboardService);
  private router = inject(Router);

  dash    = signal<DashboardStats | null>(null);
  loading = signal(true);
  error   = signal('');

  siteColor(s: string) {
    return { active: '#43e8a0', hold: '#ffa94d', done: '#6c63ff' }[s] ?? '#6c63ff';
  }

  finRows() {
    const d = this.dash();
    if (!d) return [];
    const tb = d.totalBudget || 1;
    return [
      { label: 'Total Budget', amount: this.fmt(d.totalBudget),        pct: 100, color: '#6c63ff' },
      { label: 'Received',     amount: this.fmt(d.revenueThisMonth),   pct: Math.round(d.revenueThisMonth / tb * 100), color: '#43e8a0' },
      { label: 'Pending',      amount: this.fmt(d.pendingInvoices),    pct: Math.round(d.pendingInvoices  / tb * 100), color: '#ffa94d' },
    ];
  }

  barHeight(revenue: number): number {
    const revenues = this.dash()?.monthlyRevenue?.map(r => r.revenue) ?? [1];
    const max = Math.max(...revenues, 1);
    return Math.max((revenue / max) * 100, 4);
  }

  private fmt(n: number): string {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000)    return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  }

  goto(path: string) { this.router.navigate([path]); }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.svc.get().subscribe({
      next: d  => { this.dash.set(d); this.loading.set(false); },
      error: e => { this.error.set(e.message); this.loading.set(false); }
    });
  }
}
