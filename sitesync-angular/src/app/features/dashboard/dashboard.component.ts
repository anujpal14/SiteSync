// src/app/features/dashboard/dashboard.component.ts
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { DashboardService } from "../../data/services/api.service";
import { DashboardStats } from "../../data/models/models";
import {
  KpiCardComponent,
  AvatarComponent,
  PillComponent,
  ProgressBarComponent,
  EmptyStateComponent,
} from "../../shared/components/ui.components";
import { InrFormatPipe, avatarColor } from "../../shared/pipes/format.pipe";

@Component({
  selector: "ss-dashboard",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    KpiCardComponent,
    AvatarComponent,
    PillComponent,
    ProgressBarComponent,
    InrFormatPipe,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit {
  private svc = inject(DashboardService);
  private router = inject(Router);

  dash = signal<DashboardStats | null>(null);
  loading = signal(true);
  error = signal("");

  siteColor(s: string) {
    return (
      { active: "#43e8a0", hold: "#ffa94d", done: "#6c63ff" }[s] ?? "#6c63ff"
    );
  }

  finRows() {
    const d = this.dash();
    if (!d) return [];
    const tb = d.totalBudget || 1;
    return [
      {
        label: "Total Budget",
        amount: this.fmt(d.totalBudget),
        pct: 100,
        color: "#6c63ff",
      },
      {
        label: "Received",
        amount: this.fmt(d.revenueThisMonth),
        pct: Math.round((d.revenueThisMonth / tb) * 100),
        color: "#43e8a0",
      },
      {
        label: "Pending",
        amount: this.fmt(d.pendingInvoices),
        pct: Math.round((d.pendingInvoices / tb) * 100),
        color: "#ffa94d",
      },
    ];
  }

  barHeight(revenue: number): number {
    const revenues = this.dash()?.monthlyRevenue?.map((r) => r.revenue) ?? [1];
    const max = Math.max(...revenues, 1);
    return Math.max((revenue / max) * 100, 4);
  }

  private fmt(n: number): string {
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  }

  goto(path: string) {
    this.router.navigate([path]);
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set("");
    this.svc.get().subscribe({
      next: (d) => {
        this.dash.set(d);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(e.message);
        this.loading.set(false);
      },
    });
  }
}
