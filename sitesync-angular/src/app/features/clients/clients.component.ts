// src/app/features/clients/clients.component.ts
import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ClientService } from "../../data/services/api.service";
import { Client } from "../../data/models/models";
import {
  AvatarComponent,
  PillComponent,
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
  selector: "ss-clients",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarComponent,
    PillComponent,
    ModalComponent,
    EmptyStateComponent,
    InrFormatPipe,
    ConfirmModalComponent,
  ],
  templateUrl: "./clients.component.html",
  styleUrl: "./clients.component.scss",
})
export class ClientsComponent implements OnInit {
  private svc = inject(ClientService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private confirmSvc = inject(ConfirmService);

  clients = signal<Client[]>([]);
  loading = signal(true);
  showModal = signal(false);
  form = this.fb.group({
    name: ["", Validators.required],
    phone: [""],
    email: [""],
    city: ["", Validators.required],
    address: [""],
  });
  ngOnInit() {
    this.load();
  }
  load() {
    this.svc.getAll().subscribe({
      next: (c) => {
        this.clients.set(c);
        this.loading.set(false);
      },
      error: (e) => {
        this.toast.error(e.message);
        this.loading.set(false);
      },
    });
  }
  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.svc
      .create({
        name: v.name!,
        phone: v.phone!,
        email: v.email!,
        city: v.city!,
        address: v.address!,
      })
      .subscribe({
        next: () => {
          this.showModal.set(false);
          this.form.reset();
          this.load();
          this.toast.success("Client added ✓");
        },
        error: (e) => this.toast.error(e.message),
      });
  }

  async del(id: number) {
    const ok = await this.confirmSvc.open({
      title: "Delete Client?",
      message:
        "This client will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Yes, Delete",
      cancelLabel: "Cancel",
      danger: true,
    });

    if (!ok) return;

    this.svc.delete(id).subscribe({
      next: () => {
        this.load();
        this.toast.success("Deleted");
      },
      error: (e) => this.toast.error(e.message),
    });
  }
}
