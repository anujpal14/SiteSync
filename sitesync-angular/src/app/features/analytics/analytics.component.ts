// src/app/features/analytics/analytics.component.ts
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  SiteService,
  WorkerService,
  InvoiceService,
} from "../../data/services/api.service";
import { Site, Worker, Invoice } from "../../data/models/models";
import { KpiCardComponent } from "../../shared/components/ui.components";
import { InrFormatPipe } from "../../shared/pipes/format.pipe";

@Component({
  selector: "ss-analytics",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, KpiCardComponent, InrFormatPipe],
  template: `
    <div class="page-hd">
      <div>
        <h1 class="page-title">Analytics</h1>
        <p class="page-sub">Performance overview across all sites</p>
      </div>
    </div>

    <div class="kpi-grid4" style="margin-bottom:20px">
      <ss-kpi
        [value]="avgProgress() + '%'"
        label="Avg Site Progress"
        icon="bar_chart"
        iconColor="#6c63ff"
        trend="↑ 12%"
        [trendUp]="true"
      />
      <ss-kpi
        [value]="attendPct() + '%'"
        label="Labour Attendance"
        icon="group"
        iconColor="#43e8a0"
        trend="Today"
        [trendUp]="true"
      />
      <ss-kpi
        [value]="budgetUtil() + '%'"
        label="Budget Utilisation"
        icon="account_balance"
        iconColor="#ffa94d"
      />
      <ss-kpi
        [value]="sites().length.toString()"
        label="Total Sites"
        icon="home_work"
        iconColor="#4ecdc4"
        trend="All time"
        [trendUp]="true"
      />
    </div>

    <div class="two-col">
      <!-- Revenue Chart -->
      <div class="card">
        <div class="card-hd"><div class="card-title">Monthly Revenue</div></div>
        @if (monthlyRevenue().length > 0) {
          <div class="chart-wrap">
            <div class="bars">
              @for (
                r of monthlyRevenue();
                track r.month;
                let i = $index;
                let last = $last
              ) {
                <div class="bar-group">
                  <div class="bar-val">{{ r.revenue | inrFormat }}</div>
                  <div
                    class="bar-col"
                    [class.hl]="last"
                    [style.height.%]="barH(r.revenue)"
                    [title]="r.month + ': ' + (r.revenue | inrFormat)"
                  ></div>
                  <div class="bar-lbl">{{ r.month }}</div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="no-data">No paid invoice data yet</div>
        }
      </div>

      <!-- Site Progress -->
      <div class="card">
        <div class="card-hd"><div class="card-title">Site Progress</div></div>
        @for (s of sites(); track s.id) {
          <div class="progress-row">
            <div class="pr-top">
              <span class="pr-name">{{ s.name }}</span>
              <span class="pr-pct">{{ s.progress }}%</span>
            </div>
            <div class="pr-track">
              <div
                class="pr-fill"
                [style.width.%]="s.progress"
                [style.background]="sColor(s.status)"
              ></div>
            </div>
          </div>
        }
      </div>
    </div>

    <div class="two-col" style="margin-top:16px">
      <!-- Status Breakdown -->
      <div class="card">
        <div class="card-hd">
          <div class="card-title">Site Status Breakdown</div>
        </div>
        <div class="status-grid">
          @for (row of statusBreakdown(); track row.label) {
            <div class="sb-item">
              <div class="sb-count" [style.color]="row.color">
                {{ row.count }}
              </div>
              <div class="sb-bar-wrap">
                <div
                  class="sb-bar"
                  [style.width.%]="row.pct"
                  [style.background]="row.color"
                ></div>
              </div>
              <div class="sb-label">{{ row.label }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Top Spenders -->
      <div class="card">
        <div class="card-hd">
          <div class="card-title">Budget vs Invoiced</div>
        </div>
        @for (s of sites().slice(0, 6); track s.id) {
          <div class="budget-row">
            <div class="br-name">{{ s.name }}</div>
            <div class="br-bars">
              <div class="br-track">
                <div
                  class="br-fill"
                  style="background:#6c63ff"
                  [style.width.%]="100"
                ></div>
              </div>
            </div>
            <div class="br-amt">{{ s.budget | inrFormat }}</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .page-hd {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 22px;
      }
      .page-title {
        font-family: "Syne", sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: var(--text);
      }
      .page-sub {
        font-size: 12px;
        color: var(--muted);
        margin-top: 3px;
      }
      .kpi-grid4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .card {
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-radius: 14px;
        padding: 20px;
      }
      .card-hd {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }
      .card-title {
        font-family: "Syne", sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
      }
      .chart-wrap {
        overflow: hidden;
      }
      .bars {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        height: 160px;
        padding-bottom: 24px;
        position: relative;
      }
      .bar-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        height: 100%;
        justify-content: flex-end;
        position: relative;
      }
      .bar-val {
        font-size: 9px;
        color: var(--muted);
        white-space: nowrap;
        position: absolute;
        top: -18px;
      }
      .bar-col {
        width: 100%;
        border-radius: 4px 4px 0 0;
        background: rgba(108, 99, 255, 0.25);
        min-height: 4px;
        transition: background 0.2s;
        cursor: pointer;
      }
      .bar-col:hover,
      .bar-col.hl {
        background: var(--accent);
      }
      .bar-lbl {
        font-size: 9.5px;
        color: var(--muted);
        position: absolute;
        bottom: -20px;
      }
      .no-data {
        color: var(--muted);
        font-size: 12px;
        text-align: center;
        padding: 40px;
      }
      .progress-row {
        margin-bottom: 14px;
      }
      .pr-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .pr-name {
        font-size: 12px;
        color: var(--text);
      }
      .pr-pct {
        font-size: 11.5px;
        color: var(--muted);
      }
      .pr-track {
        height: 6px;
        background: var(--surface2);
        border-radius: 3px;
        overflow: hidden;
      }
      .pr-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.5s;
      }
      .status-grid {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .sb-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sb-count {
        font-family: "Syne", sans-serif;
        font-size: 20px;
        font-weight: 700;
        min-width: 32px;
      }
      .sb-bar-wrap {
        flex: 1;
        height: 8px;
        background: var(--surface2);
        border-radius: 4px;
        overflow: hidden;
      }
      .sb-bar {
        height: 100%;
        border-radius: 4px;
      }
      .sb-label {
        font-size: 12px;
        color: var(--muted);
        min-width: 64px;
      }
      .budget-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 12px;
      }
      .br-name {
        font-size: 12px;
        color: var(--text);
        width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .br-bars {
        flex: 1;
      }
      .br-track {
        height: 5px;
        background: var(--surface2);
        border-radius: 3px;
        overflow: hidden;
      }
      .br-fill {
        height: 100%;
        border-radius: 3px;
      }
      .br-amt {
        font-size: 11.5px;
        color: var(--muted);
        min-width: 56px;
        text-align: right;
      }
    `,
  ],
})
export class AnalyticsComponent implements OnInit {
  private siteSvc = inject(SiteService);
  private workerSvc = inject(WorkerService);
  private invoiceSvc = inject(InvoiceService);

  sites = signal<Site[]>([]);
  workers = signal<Worker[]>([]);
  invoices = signal<Invoice[]>([]);

  avgProgress = () => {
    const s = this.sites();
    return s.length
      ? Math.round(s.reduce((a, x) => a + x.progress, 0) / s.length)
      : 0;
  };

  attendPct = () => {
    const w = this.workers();
    return w.length
      ? Math.round(
          (w.filter((x) => x.todayStatus === "present").length / w.length) *
            100,
        )
      : 0;
  };

  budgetUtil = () => {
    const tb = this.sites().reduce((a, s) => a + s.budget, 0);
    const ti = this.invoices().reduce((a, i) => a + i.amount, 0);
    return tb ? Math.round((ti / tb) * 100) : 0;
  };

  monthlyRevenue = () => {
    const map: Record<string, number> = {};
    this.invoices()
      .filter((i) => i.status === "paid")
      .forEach((i) => {
        const m = new Date(i.createdAt).toLocaleString("en-IN", {
          month: "short",
        });
        map[m] = (map[m] ?? 0) + i.amount;
      });
    return Object.entries(map).map(([month, revenue]) => ({ month, revenue }));
  };

  barH = (rev: number) => {
    const revs = this.monthlyRevenue().map((r) => r.revenue);
    const max = Math.max(...revs, 1);
    return Math.max((rev / max) * 100, 4);
  };

  sColor = (s: string) =>
    ({ active: "#43e8a0", hold: "#ffa94d", done: "#6c63ff" })[s] ?? "#888";

  statusBreakdown = () => {
    const s = this.sites();
    const total = s.length || 1;
    return [
      {
        label: "Active",
        count: s.filter((x) => x.status === "active").length,
        color: "#43e8a0",
        pct: (s.filter((x) => x.status === "active").length / total) * 100,
      },
      {
        label: "On Hold",
        count: s.filter((x) => x.status === "hold").length,
        color: "#ffa94d",
        pct: (s.filter((x) => x.status === "hold").length / total) * 100,
      },
      {
        label: "Complete",
        count: s.filter((x) => x.status === "done").length,
        color: "#6c63ff",
        pct: (s.filter((x) => x.status === "done").length / total) * 100,
      },
    ];
  };

  ngOnInit() {
    this.siteSvc.getAll().subscribe((s) => this.sites.set(s));
    this.workerSvc.getAll().subscribe((w) => this.workers.set(w));
    this.invoiceSvc.getAll().subscribe((i) => this.invoices.set(i));
  }
}
