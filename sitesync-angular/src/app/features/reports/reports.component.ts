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
  icon: string;
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
  templateUrl: "./reports.component.html",
  styleUrl: "./reports.component.scss",
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
      icon: "domain",
      title: "Site Summary Report",
      desc: "Progress, budget, status and client for every site.",
      accentColor: "#6c63ff",
      dataKeys: ["sites"],
    },
    {
      id: "labour",
      icon: "engineering",
      title: "Labour Attendance Report",
      desc: "Workers, roles, daily wages, monthly estimates and today's attendance.",
      accentColor: "#4ecdc4",
      dataKeys: ["workers"],
    },
    {
      id: "finance",
      icon: "payments",
      title: "Finance & Invoice Report",
      desc: "All invoices with amounts, due dates and payment status.",
      accentColor: "#43e8a0",
      dataKeys: ["invoices"],
    },
    {
      id: "clients",
      icon: "handshake",
      title: "Client Report",
      desc: "Client directory with site count, total value and status.",
      accentColor: "#ffa94d",
      dataKeys: ["clients"],
    },
    {
      id: "material",
      icon: "inventory_2",
      title: "Material & Resource Report",
      desc: "Worker allocation per site, roles, costs and attendance summary.",
      accentColor: "#ff6b6b",
      dataKeys: ["sites", "workers"],
    },
    {
      id: "pnl",
      icon: "query_stats",
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
