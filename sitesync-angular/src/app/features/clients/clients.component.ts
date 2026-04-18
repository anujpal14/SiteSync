// src/app/features/clients/clients.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ClientService } from '../../data/services/api.service';
import { Client } from '../../data/models/models';
import { AvatarComponent, PillComponent, ModalComponent, EmptyStateComponent, ToastService } from '../../shared/components/ui.components';
import { InrFormatPipe } from '../../shared/pipes/format.pipe';

@Component({
  selector: 'ss-clients',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent, PillComponent, ModalComponent, EmptyStateComponent, InrFormatPipe],
  template: `
    <div class="page-hd">
      <div><h1 class="page-title">Clients</h1><p class="page-sub">All your client relationships</p></div>
      <button class="btn-primary" (click)="showModal.set(true)">+ Add Client</button>
    </div>

    <div class="card">
      <div class="card-hd">
        <div class="card-title">Client Directory ({{ clients().length }})</div>
      </div>
      @if (loading()) {
        <div class="loading-rows">@for (i of [1,2,3]; track i){<div class="shimmer-row"></div>}</div>
      } @else if (clients().length === 0) {
        <ss-empty emoji="🤝" title="No clients" subtitle="Add your first client"
          actionLabel="Add Client" (action)="showModal.set(true)"/>
      } @else {
        <table class="ss-table">
          <thead><tr><th>Name</th><th>Phone</th><th>City</th><th>Sites</th><th>Total Value</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (c of clients(); track c.id; let i = $index) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <ss-avatar [name]="c.name" [size]="30" [index]="i" [rounded]="false" [fontSize]="10"/>
                    <div>
                      <div style="font-weight:500">{{ c.name }}</div>
                      <div style="font-size:10.5px;color:var(--muted)">{{ c.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="muted">{{ c.phone }}</td>
                <td class="muted">{{ c.city }}</td>
                <td>{{ c.siteCount }} site{{ c.siteCount !== 1 ? 's' : '' }}</td>
                <td style="font-weight:500;color:#43e8a0">{{ c.totalValue | inrFormat }}</td>
                <td><ss-pill [status]="c.status"/></td>
                <td><button class="btn-danger-sm" (click)="del(c.id)">Delete</button></td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <ss-modal [open]="showModal()" title="Add New Client" (closed)="showModal.set(false)">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Full Name</label><input class="form-input" formControlName="name" placeholder="e.g. Anil Sharma"/></div>
          <div class="form-row"><label class="form-label">Phone</label><input class="form-input" formControlName="phone" placeholder="+91 98765 43210"/></div>
          <div class="form-row"><label class="form-label">Email</label><input class="form-input" formControlName="email" placeholder="email@example.com"/></div>
          <div class="form-row"><label class="form-label">City</label><input class="form-input" formControlName="city" placeholder="e.g. Mumbai"/></div>
        </div>
        <div class="form-row"><label class="form-label">Address</label><input class="form-input" formControlName="address" placeholder="Full address"/></div>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" (click)="showModal.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Add Client</button>
        </div>
      </form>
    </ss-modal>`,
  styles: [`:host{display:block}.page-hd{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}.page-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text)}.page-sub{font-size:12px;color:var(--muted);margin-top:3px}.card{background:var(--surface);border:0.5px solid var(--border);border-radius:14px;padding:20px}.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.card-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text)}.ss-table{width:100%;border-collapse:collapse}.ss-table th{text-align:left;font-size:10px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:1px;padding:0 12px 10px;border-bottom:0.5px solid var(--border)}.ss-table td{padding:11px 12px;font-size:12.5px;border-bottom:0.5px solid var(--border);vertical-align:middle}.ss-table tr:last-child td{border-bottom:none}.ss-table tbody tr:hover td{background:rgba(255,255,255,.02)}.muted{color:var(--muted)!important}.btn-primary{background:var(--accent);color:#fff;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer}.btn-ghost{background:var(--surface2);color:var(--text);border:0.5px solid var(--border);border-radius:9px;padding:9px 18px;font-size:13px;cursor:pointer}.btn-danger-sm{background:rgba(255,107,107,.1);color:#ff6b6b;border:0.5px solid rgba(255,107,107,.2);border-radius:7px;padding:5px 10px;font-size:11px;cursor:pointer}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.form-label{font-size:10.5px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}.form-input{background:var(--surface2);border:0.5px solid var(--border);border-radius:9px;padding:9px 13px;color:var(--text);font-size:13px;outline:none;width:100%;box-sizing:border-box}.form-input:focus{border-color:var(--accent)}.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px;border-top:0.5px solid var(--border);padding-top:18px}.loading-rows{display:flex;flex-direction:column;gap:10px}.shimmer-row{height:44px;border-radius:8px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:200%;animation:sh 1.4s infinite}@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`]
})
export class ClientsComponent implements OnInit {
  private svc   = inject(ClientService);
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);
  clients   = signal<Client[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  form = this.fb.group({ name:['',Validators.required], phone:[''], email:[''], city:['',Validators.required], address:[''] });
  ngOnInit() { this.load(); }
  load() { this.svc.getAll().subscribe({ next:c=>{this.clients.set(c);this.loading.set(false)}, error:e=>{this.toast.error(e.message);this.loading.set(false)} }); }
  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.svc.create({ name:v.name!, phone:v.phone!, email:v.email!, city:v.city!, address:v.address! }).subscribe({
      next:()=>{this.showModal.set(false);this.form.reset();this.load();this.toast.success('Client added ✓')},
      error:e=>this.toast.error(e.message)
    });
  }
  del(id:number){ if(!confirm('Delete client?')) return; this.svc.delete(id).subscribe({next:()=>{this.load();this.toast.success('Deleted')},error:e=>this.toast.error(e.message)}); }
}
