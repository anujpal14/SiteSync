// src/app/features/reports/reports.component.ts
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { forkJoin } from "rxjs";
import {
  SiteService,
  ClientService,
  WorkerService,
  InvoiceService,
} from "../../data/services/api.service";
import { Site, Client, Worker, Invoice } from "../../data/models/models";
import { PdfService } from "../../core/services/pdf.service";
import { ToastService } from "../../shared/components/ui.components";

interface ReportCard {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  accentColor: string;
  dataKeys: ("sites" | "clients" | "workers" | "invoices")[];
}

@Component({
  selector: "ss-reports",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="page-hd">
      <div>
        <h1 class="page-title">Reports</h1>
        <p class="page-sub">
          Generate and download PDF reports for all modules
        </p>
      </div>
      <!-- Refresh data button -->
      <button class="btn-ghost" (click)="loadData()" [disabled]="dataLoading()">
        <span
          class="material-icon"
          style="font-size:16px;vertical-align:middle"
          [class.spin]="dataLoading()"
          >refresh</span
        >
        {{ dataLoading() ? "Loading…" : "Refresh Data" }}
      </button>
    </div>

    <!-- Data status bar -->
    <div class="status-bar">
      @if (dataLoading()) {
        <div class="status-chip loading">
          <span class="dot-pulse"></span> Fetching live data…
        </div>
      } @else if (dataError()) {
        <div class="status-chip error">
          ⚠️ {{ dataError() }} —
          <span class="retry-link" (click)="loadData()">retry</span>
        </div>
      } @else {
        <div class="status-chip ok">
          ✓ Live data loaded —
          <strong>{{ sites().length }}</strong> sites ·
          <strong>{{ clients().length }}</strong> clients ·
          <strong>{{ workers().length }}</strong> workers ·
          <strong>{{ invoices().length }}</strong> invoices
        </div>
      }
    </div>

    <!-- Report cards grid -->
    <div class="cards-grid">
      @for (r of reportCards; track r.id) {
        <div class="report-card" [style.--accent]="r.accentColor">
          <div class="card-top">
            <div class="card-emoji">{{ r.emoji }}</div>
            <div class="card-info">
              <div class="card-title">{{ r.title }}</div>
              <div class="card-desc">{{ r.desc }}</div>
            </div>
          </div>

          <!-- Data summary chips -->
          <div class="data-chips">
            @if (r.dataKeys.includes("sites")) {
              <span class="chip">{{ sites().length }} sites</span>
            }
            @if (r.dataKeys.includes("clients")) {
              <span class="chip">{{ clients().length }} clients</span>
            }
            @if (r.dataKeys.includes("workers")) {
              <span class="chip">{{ workers().length }} workers</span>
            }
            @if (r.dataKeys.includes("invoices")) {
              <span class="chip">{{ invoices().length }} invoices</span>
            }
          </div>

          <button
            class="btn-generate"
            [disabled]="generating()[r.id] || dataLoading() || !!dataError()"
            (click)="generate(r.id)"
          >
            @if (generating()[r.id]) {
              <span class="spinner"></span> Generating…
            } @else {
              <span class="material-icon btn-icon">picture_as_pdf</span>
              Generate PDF
            }
          </button>
        </div>
      }
    </div>

    <!-- How it works -->
    <div class="info-card">
      <div class="info-title">
        <span
          class="material-icon"
          style="font-size:16px;vertical-align:middle;color:#6c63ff"
          >info</span
        >
        How reports work
      </div>
      <div class="info-body">
        Each report fetches <strong>live data</strong> from your API at the
        moment you click Generate, builds a formatted A4 PDF with your company
        header, KPI summary boxes, and detailed tables, then downloads it
        automatically. No server-side rendering needed.
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
        margin-bottom: 16px;
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

      .btn-ghost {
        background: var(--surface2);
        color: var(--text);
        border: 0.5px solid var(--border);
        border-radius: 9px;
        padding: 9px 16px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: border 0.15s;
      }
      .btn-ghost:hover:not(:disabled) {
        border-color: var(--border2);
      }
      .btn-ghost:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Status bar */
      .status-bar {
        margin-bottom: 22px;
      }
      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 12.5px;
      }
      .status-chip.ok {
        background: rgba(67, 232, 160, 0.08);
        color: #43e8a0;
        border: 0.5px solid rgba(67, 232, 160, 0.2);
      }
      .status-chip.loading {
        background: rgba(108, 99, 255, 0.08);
        color: #6c63ff;
        border: 0.5px solid rgba(108, 99, 255, 0.2);
      }
      .status-chip.error {
        background: rgba(255, 107, 107, 0.08);
        color: #ff6b6b;
        border: 0.5px solid rgba(255, 107, 107, 0.2);
      }
      .status-chip.ok strong {
        color: var(--text);
      }
      .retry-link {
        text-decoration: underline;
        cursor: pointer;
      }

      .dot-pulse {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #6c63ff;
        animation: pulse 1.2s ease-in-out infinite;
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(0.7);
        }
      }

      /* Cards grid */
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;
      }

      .report-card {
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-radius: 14px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        transition:
          border-color 0.2s,
          transform 0.2s;
        border-top: 3px solid var(--accent);
      }
      .report-card:hover {
        border-color: var(--accent);
        transform: translateY(-2px);
      }

      .card-top {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .card-emoji {
        font-size: 32px;
        line-height: 1;
        flex-shrink: 0;
      }
      .card-title {
        font-family: "Syne", sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 4px;
      }
      .card-desc {
        font-size: 11.5px;
        color: var(--muted);
        line-height: 1.5;
      }

      .data-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .chip {
        background: var(--surface2);
        border: 0.5px solid var(--border);
        border-radius: 20px;
        padding: 3px 10px;
        font-size: 11px;
        color: var(--muted);
      }

      .btn-generate {
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 9px;
        padding: 11px 0;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition:
          background 0.15s,
          transform 0.1s;
        margin-top: auto;
      }
      .btn-generate:hover:not(:disabled) {
        background: #5a52e0;
      }
      .btn-generate:active:not(:disabled) {
        transform: scale(0.98);
      }
      .btn-generate:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-icon {
        font-size: 16px !important;
        font-family: "Material Symbols Outlined";
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Info card */
      .info-card {
        background: rgba(108, 99, 255, 0.06);
        border: 0.5px solid rgba(108, 99, 255, 0.2);
        border-radius: 12px;
        padding: 16px 20px;
      }
      .info-title {
        font-size: 13px;
        font-weight: 500;
        color: var(--text);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .info-body {
        font-size: 12px;
        color: var(--muted);
        line-height: 1.6;
      }
      .info-body strong {
        color: var(--text);
      }

      .spin {
        animation: spin 0.8s linear infinite;
        display: inline-block;
      }
      .material-icon {
        font-family: "Material Symbols Outlined";
        font-style: normal;
      }
    `,
  ],
})
export class ReportsComponent implements OnInit {
  private siteSvc = inject(SiteService);
  private clientSvc = inject(ClientService);
  private workerSvc = inject(WorkerService);
  private invoiceSvc = inject(InvoiceService);
  private pdfSvc = inject(PdfService);
  private toast = inject(ToastService);

  // ── Data signals ──────────────────────────────────────
  sites = signal<Site[]>([]);
  clients = signal<Client[]>([]);
  workers = signal<Worker[]>([]);
  invoices = signal<Invoice[]>([]);

  dataLoading = signal(true);
  dataError = signal("");

  // Per-card generating state
  generating = signal<Record<string, boolean>>({});

  // ── Report card definitions ───────────────────────────
  readonly reportCards: ReportCard[] = [
    {
      id: "sites",
      emoji: "🏗️",
      title: "Site Summary Report",
      desc: "Progress, budget, status and client for every site.",
      accentColor: "#6c63ff",
      dataKeys: ["sites"],
    },
    {
      id: "labour",
      emoji: "👷",
      title: "Labour Attendance Report",
      desc: "Workers, roles, daily wages, monthly estimates and today's attendance.",
      accentColor: "#4ecdc4",
      dataKeys: ["workers"],
    },
    {
      id: "finance",
      emoji: "💰",
      title: "Finance & Invoice Report",
      desc: "All invoices with amounts, due dates and payment status.",
      accentColor: "#43e8a0",
      dataKeys: ["invoices"],
    },
    {
      id: "clients",
      emoji: "🤝",
      title: "Client Report",
      desc: "Client directory with site count, total value and status.",
      accentColor: "#ffa94d",
      dataKeys: ["clients"],
    },
    {
      id: "material",
      emoji: "📦",
      title: "Material & Resource Report",
      desc: "Worker allocation per site, roles, costs and attendance summary.",
      accentColor: "#ff6b6b",
      dataKeys: ["sites", "workers"],
    },
    {
      id: "pnl",
      emoji: "📊",
      title: "Profit & Loss Report",
      desc: "Revenue vs labour costs, net profit, margin and site budgets.",
      accentColor: "#a78bfa",
      dataKeys: ["sites", "invoices", "workers"],
    },
  ];

  ngOnInit() {
    this.loadData();
  }

  // ── Fetch all data upfront ────────────────────────────
  loadData() {
    this.dataLoading.set(true);
    this.dataError.set("");

    forkJoin({
      sites: this.siteSvc.getAll(),
      clients: this.clientSvc.getAll(),
      workers: this.workerSvc.getAll(),
      invoices: this.invoiceSvc.getAll(),
    }).subscribe({
      next: ({ sites, clients, workers, invoices }) => {
        this.sites.set(sites);
        this.clients.set(clients);
        this.workers.set(workers);
        this.invoices.set(invoices);
        this.dataLoading.set(false);
      },
      error: (e) => {
        this.dataError.set(e.message ?? "Failed to load data");
        this.dataLoading.set(false);
      },
    });
  }

  // ── Generate PDF for a given report id ───────────────
  async generate(id: string) {
    // Mark this card as generating
    this.generating.update((g) => ({ ...g, [id]: true }));

    try {
      switch (id) {
        case "sites":
          await this.pdfSvc.generateSiteReport(this.sites());
          break;
        case "labour":
          await this.pdfSvc.generateLabourReport(this.workers());
          break;
        case "finance":
          await this.pdfSvc.generateFinanceReport(this.invoices());
          break;
        case "clients":
          await this.pdfSvc.generateClientReport(this.clients());
          break;
        case "material":
          await this.pdfSvc.generateMaterialReport(
            this.sites(),
            this.workers(),
          );
          break;
        case "pnl":
          await this.pdfSvc.generatePnLReport(
            this.sites(),
            this.invoices(),
            this.workers(),
          );
          break;
      }
      this.toast.success("PDF downloaded ✓");
    } catch (e: any) {
      this.toast.error("PDF failed: " + (e?.message ?? "Unknown error"));
      console.error("PDF generation error:", e);
    } finally {
      this.generating.update((g) => ({ ...g, [id]: false }));
    }
  }
}
