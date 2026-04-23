import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { SiteService, ClientService } from "../../data/services/api.service";
import { Site, Client } from "../../data/models/models";
import {
  PillComponent,
  ProgressBarComponent,
  KpiCardComponent,
  ModalComponent,
  EmptyStateComponent,
  ToastService,
} from "../../shared/components/ui.components";
import { InrFormatPipe, SsDatePipe } from "../../shared/pipes/format.pipe";
import {
  ConfirmModalComponent,
  ConfirmService,
} from "@shared/components/confirm-modal.component";

@Component({
  selector: "ss-sites",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PillComponent,
    ProgressBarComponent,
    KpiCardComponent,
    ModalComponent,
    EmptyStateComponent,
    InrFormatPipe,
    SsDatePipe,
    ConfirmModalComponent,
  ],
  templateUrl: "./sites.component.html",
  styleUrl: "./sites.component.scss",
})
export class SitesComponent implements OnInit {
  private siteSvc = inject(SiteService);
  private clientSvc = inject(ClientService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private confirmSvc = inject(ConfirmService);

  sites = signal<Site[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  filter = signal("");

  active = () => this.sites().filter((s) => s.status === "active").length;
  hold = () => this.sites().filter((s) => s.status === "hold").length;
  done = () => this.sites().filter((s) => s.status === "done").length;

  form = this.fb.group({
    name: ["", Validators.required],
    city: ["", Validators.required],
    clientId: ["", Validators.required],
    startDate: [new Date().toISOString().split("T")[0]],
    budget: [0],
    status: ["active"],
    address: [""],
  });

  sColor(s: string) {
    return { active: "#43e8a0", hold: "#ffa94d", done: "#6c63ff" }[s] ?? "#888";
  }

  ngOnInit() {
    this.load();
    this.clientSvc.getAll().subscribe((c) => this.clients.set(c));
  }

  load(status?: string) {
    this.loading.set(true);
    this.siteSvc.getAll(status).subscribe({
      next: (s) => {
        this.sites.set(s);
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
    this.load(v || undefined);
  }

  openModal() {
    this.showModal.set(true);
  }

  submitSite() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.siteSvc
      .create({
        clientId: +v.clientId!,
        name: v.name!,
        city: v.city!,
        address: v.address!,
        startDate: v.startDate!,
        budget: +v.budget!,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showModal.set(false);
          this.form.reset({
            startDate: new Date().toISOString().split("T")[0],
            status: "active",
          });
          this.load();
          this.toast.success("Site added ✓");
        },
        error: (e) => {
          this.saving.set(false);
          this.toast.error(e.message);
        },
      });
  }

  async deleteSite(id: number) {
    const ok = await this.confirmSvc.open({
      title: "Delete Site?",
      message:
        "This site will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Yes, Delete",
      cancelLabel: "Cancel",
      danger: true,
    });

    if (!ok) return;

    this.siteSvc.delete(id).subscribe({
      next: () => {
        this.load();
        this.toast.success("Site deleted");
      },
      error: (e) => this.toast.error(e.message),
    });
  }
}
