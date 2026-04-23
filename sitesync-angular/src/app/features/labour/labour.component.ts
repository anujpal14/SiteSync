// src/app/features/labour/labour.component.ts
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
  WorkerService,
  AttendanceService,
  SiteService,
} from "../../data/services/api.service";
import { Worker, Site, WORKER_ROLES } from "../../data/models/models";
import {
  AvatarComponent,
  KpiCardComponent,
  ModalComponent,
  EmptyStateComponent,
  ToastService,
} from "../../shared/components/ui.components";
import { InrFormatPipe } from "../../shared/pipes/format.pipe";
import {
  ConfirmModalComponent,
  ConfirmService,
} from "@shared/components/confirm-modal.component";

@Component({
  selector: "ss-labour",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    KpiCardComponent,
    ModalComponent,
    EmptyStateComponent,
    InrFormatPipe,
    ConfirmModalComponent,
  ],
  templateUrl: "./labour.component.html",
  styleUrl: "./labour.component.scss",
})
export class LabourComponent implements OnInit {
  private workerSvc = inject(WorkerService);
  private attendSvc = inject(AttendanceService);
  private siteSvc = inject(SiteService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private confirmSvc = inject(ConfirmService);

  workers = signal<Worker[]>([]);
  sites = signal<Site[]>([]);
  loading = signal(true);
  showModal = signal(false);
  roles = WORKER_ROLES;
  present = () =>
    this.workers().filter((w) => w.todayStatus === "present").length;
  absent = () =>
    this.workers().filter((w) => w.todayStatus === "absent").length;
  wages = () =>
    this.workers().reduce(
      (a, w) => a + (w.todayStatus === "present" ? w.dailyWage * 26 : 0),
      0,
    );
  form = this.fb.group({
    name: ["", Validators.required],
    role: ["Supervisor"],
    phone: [""],
    dailyWage: [0],
    siteId: [""],
    todayStatus: ["present"],
  });
  ngOnInit() {
    this.load();
    this.siteSvc.getAll().subscribe((s) => this.sites.set(s));
  }
  load() {
    this.workerSvc.getAll().subscribe({
      next: (w) => {
        this.workers.set(w);
        this.loading.set(false);
      },
      error: (e) => {
        this.toast.error(e.message);
        this.loading.set(false);
      },
    });
  }
  toggleAttend(w: Worker) {
    const next = w.todayStatus === "present" ? "absent" : "present";
    this.attendSvc.markToday(w.id, w.siteId, next).subscribe({
      next: () => {
        this.workers.update((ws) =>
          ws.map((x) => (x.id === w.id ? { ...x, todayStatus: next } : x)),
        );
        this.toast.success(`${w.name}: ${next}`);
      },
      error: (e) => this.toast.error(e.message),
    });
  }
  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.workerSvc
      .create({
        name: v.name!,
        phone: v.phone!,
        role: v.role!,
        dailyWage: +v.dailyWage!,
        siteId: v.siteId ? +v.siteId! : undefined,
      })
      .subscribe({
        next: (worker) => {
          this.attendSvc
            .markToday(worker.id, worker.siteId, v.todayStatus as any)
            .subscribe();
          this.showModal.set(false);
          this.form.reset({ role: "Supervisor", todayStatus: "present" });
          this.load();
          this.toast.success("Worker added ✓");
        },
        error: (e) => this.toast.error(e.message),
      });
  }
  async del(id: number) {
    const ok = await this.confirmSvc.open({
      title: "Delete Worker?",
      message:
        "This worker will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Yes, Delete",
      cancelLabel: "Cancel",
      danger: true,
    });

    if (!ok) return;

    this.workerSvc.delete(id).subscribe({
      next: () => {
        this.load();
        this.toast.success("Deleted");
      },
      error: (e) => this.toast.error(e.message),
    });
  }
}
