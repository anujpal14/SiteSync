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
  templateUrl: "./analytics.component.html",
  styleUrl: "./analytics.component.scss",
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
