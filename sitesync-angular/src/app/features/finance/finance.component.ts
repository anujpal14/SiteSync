// src/app/features/finance/finance.component.ts
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import {
  InvoiceService,
  ClientService,
  SiteService,
} from "../../data/services/api.service";
import { Invoice, Client, Site } from "../../data/models/models";
import {
  KpiCardComponent,
  PillComponent,
  ModalComponent,
  EmptyStateComponent,
  ToastService,
} from "../../shared/components/ui.components";
import { InrFormatPipe, SsDatePipe } from "../../shared/pipes/format.pipe";

@Component({
  selector: "ss-finance",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    KpiCardComponent,
    PillComponent,
    ModalComponent,
    EmptyStateComponent,
    InrFormatPipe,
    SsDatePipe,
  ],
  templateUrl: "./finance.component.html",
  styleUrl: "./finance.component.scss",
})
export class FinanceComponent implements OnInit {
  private invSvc = inject(InvoiceService);
  private clientSvc = inject(ClientService);
  private siteSvc = inject(SiteService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  invoices = signal<Invoice[]>([]);
  clients = signal<Client[]>([]);
  sites = signal<Site[]>([]);
  loading = signal(true);
  showModal = signal(false);
  total = () => this.invoices().reduce((a, i) => a + i.amount, 0);
  paid = () =>
    this.invoices()
      .filter((i) => i.status === "paid")
      .reduce((a, i) => a + i.amount, 0);
  pend = () =>
    this.invoices()
      .filter((i) => i.status !== "paid")
      .reduce((a, i) => a + i.amount, 0);
  over = () =>
    this.invoices()
      .filter((i) => i.status === "overdue")
      .reduce((a, i) => a + i.amount, 0);
  form = this.fb.group({
    clientId: ["", Validators.required],
    siteId: [""],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    dueDate: [
      new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0],
      Validators.required,
    ],
    notes: [""],
  });
  ngOnInit() {
    this.load();
    this.clientSvc.getAll().subscribe((c) => this.clients.set(c));
    this.siteSvc.getAll().subscribe((s) => this.sites.set(s));
  }
  load(status?: string) {
    this.invSvc.getAll(status).subscribe({
      next: (i) => {
        this.invoices.set(i);
        this.loading.set(false);
      },
      error: (e) => {
        this.toast.error(e.message);
        this.loading.set(false);
      },
    });
  }
  onFilter(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.loading.set(true);
    this.load(v || undefined);
  }
  openAddModal() {
    this.showModal.set(true);
  }
  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.invSvc
      .create({
        clientId: +v.clientId!,
        siteId: v.siteId ? +v.siteId! : undefined,
        amount: +v.amount!,
        dueDate: v.dueDate!,
        notes: v.notes!,
      })
      .subscribe({
        next: () => {
          this.showModal.set(false);
          this.form.reset();
          this.load();
          this.toast.success("Invoice created ✓");
        },
        error: (e) => this.toast.error(e.message),
      });
  }
  markPaid(id: number) {
    this.invSvc.markPaid(id).subscribe({
      next: () => {
        this.load();
        this.toast.success("Marked as paid ✓");
      },
      error: (e) => this.toast.error(e.message),
    });
  }
}
