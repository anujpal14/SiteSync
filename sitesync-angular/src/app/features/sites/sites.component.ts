// src/app/features/sites/sites.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SiteService, ClientService } from '../../data/services/api.service';
import { Site, Client } from '../../data/models/models';
import { PillComponent, ProgressBarComponent, KpiCardComponent, ModalComponent, EmptyStateComponent, ToastService } from '../../shared/components/ui.components';
import { InrFormatPipe, SsDatePipe } from '../../shared/pipes/format.pipe';

@Component({
  selector: 'ss-sites',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, PillComponent, ProgressBarComponent, KpiCardComponent, ModalComponent, EmptyStateComponent, InrFormatPipe, SsDatePipe],
  template: `
    <div class="page-hd">
      <div>
        <h1 class="page-title">Sites</h1>
        <p class="page-sub">Manage all your project locations</p>
      </div>
      <button class="btn-primary" (click)="openModal()">
        <span>+</span> Add Site
      </button>
    </div>

    <!-- KPIs -->
    <div class="kpi-grid3" style="margin-bottom:20px">
      <ss-kpi [value]="active().toString()" label="Active" icon="check_circle" iconColor="#43e8a0"/>
      <ss-kpi [value]="hold().toString()"   label="On Hold" icon="pause_circle" iconColor="#ffa94d"/>
      <ss-kpi [value]="done().toString()"   label="Complete" icon="task_alt" iconColor="#6c63ff"/>
    </div>

    <!-- Filter -->
    <div class="card">
      <div class="card-hd">
        <div class="card-title">All Sites ({{ sites().length }})</div>
        <select class="filter-sel" (change)="onFilter($event)">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="hold">On Hold</option>
          <option value="done">Completed</option>
        </select>
      </div>

      @if (loading()) {
        <div class="loading-rows">
          @for (i of [1,2,3,4,5]; track i) { <div class="shimmer-row"></div> }
        </div>
      } @else if (sites().length === 0) {
        <ss-empty emoji="🏗️" title="No sites found" subtitle="Add your first project site"
          actionLabel="Add Site" (action)="openModal()"/>
      } @else {
        <table class="ss-table">
          <thead><tr>
            <th>Site Name</th><th>City</th><th>Client</th>
            <th>Start Date</th><th>Budget</th><th>Progress</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            @for (site of sites(); track site.id) {
              <tr>
                <td>
                  <span class="dot" [style.background]="sColor(site.status)"></span>
                  <strong>{{ site.name }}</strong>
                </td>
                <td class="muted">{{ site.city }}</td>
                <td class="muted">{{ site.clientName }}</td>
                <td class="muted">{{ site.startDate | ssDate }}</td>
                <td class="muted">{{ site.budget | inrFormat }}</td>
                <td><ss-progress [progress]="site.progress" [status]="site.status"/></td>
                <td><ss-pill [status]="site.status"/></td>
                <td>
                  <button class="btn-danger-sm" (click)="deleteSite(site.id)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <!-- ADD MODAL -->
    <ss-modal [open]="showModal()" title="Add New Site" (closed)="showModal.set(false)">
      <form [formGroup]="form" (ngSubmit)="submitSite()">
        <div class="form-grid">
          <div class="form-row">
            <label class="form-label">Site Name</label>
            <input class="form-input" formControlName="name" placeholder="e.g. Sharma Villa"/>
          </div>
          <div class="form-row">
            <label class="form-label">City</label>
            <input class="form-input" formControlName="city" placeholder="e.g. Mumbai"/>
          </div>
          <div class="form-row">
            <label class="form-label">Client</label>
            <select class="form-input" formControlName="clientId">
              <option value="">Select Client</option>
              @for (c of clients(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">Start Date</label>
            <input class="form-input" type="date" formControlName="startDate"/>
          </div>
          <div class="form-row">
            <label class="form-label">Budget (₹)</label>
            <input class="form-input" type="number" formControlName="budget" placeholder="e.g. 1500000"/>
          </div>
          <div class="form-row">
            <label class="form-label">Status</label>
            <select class="form-input" formControlName="status">
              <option value="active">Active</option>
              <option value="hold">On Hold</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">Address</label>
          <input class="form-input" formControlName="address" placeholder="Full site address"/>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" (click)="showModal.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Adding…' : 'Add Site' }}
          </button>
        </div>
      </form>
    </ss-modal>
  `,
  styles: [`
    :host { display:block; }
    .page-hd { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:22px; }
    .page-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:700; color:var(--text); }
    .page-sub { font-size:12px; color:var(--muted); margin-top:3px; }
    .kpi-grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
    .card { background:var(--surface); border:0.5px solid var(--border); border-radius:14px; padding:20px; }
    .card-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
    .card-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:var(--text); }
    .filter-sel { background:var(--surface2); border:0.5px solid var(--border); border-radius:8px;
      color:var(--text); padding:6px 10px; font-size:12px; outline:none; }
    .btn-primary { background:var(--accent); color:#fff; border:none; border-radius:9px;
      padding:10px 20px; font-size:13px; font-weight:500; cursor:pointer; display:flex; align-items:center; gap:6px; }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .btn-ghost { background:var(--surface2); color:var(--text); border:0.5px solid var(--border);
      border-radius:9px; padding:9px 18px; font-size:13px; cursor:pointer; }
    .btn-danger-sm { background:rgba(255,107,107,.1); color:#ff6b6b; border:0.5px solid rgba(255,107,107,.2);
      border-radius:7px; padding:5px 10px; font-size:11px; cursor:pointer; }
    .ss-table { width:100%; border-collapse:collapse; }
    .ss-table th { text-align:left; font-size:10px; font-weight:500; color:var(--muted);
      text-transform:uppercase; letter-spacing:1px; padding:0 12px 10px; border-bottom:0.5px solid var(--border); }
    .ss-table td { padding:11px 12px; font-size:12.5px; border-bottom:0.5px solid var(--border); vertical-align:middle; }
    .ss-table tr:last-child td { border-bottom:none; }
    .ss-table tbody tr:hover td { background:rgba(255,255,255,.02); }
    .dot { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:8px; }
    .muted { color:var(--muted) !important; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
    .form-row { display:flex; flex-direction:column; gap:6px; }
    .form-label { font-size:10.5px; font-weight:500; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
    .form-input { background:var(--surface2); border:0.5px solid var(--border); border-radius:9px;
      padding:9px 13px; color:var(--text); font-size:13px; outline:none; width:100%; }
    .form-input:focus { border-color:var(--accent); }
    .modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:22px;
      border-top:0.5px solid var(--border); padding-top:18px; }
    .loading-rows { display:flex; flex-direction:column; gap:10px; }
    .shimmer-row { height:44px; border-radius:8px; background:var(--surface2); animation:sh 1.4s infinite;
      background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);
      background-size:200%; }
    @keyframes sh { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `]
})
export class SitesComponent implements OnInit {
  private siteSvc   = inject(SiteService);
  private clientSvc = inject(ClientService);
  private toast     = inject(ToastService);
  private fb        = inject(FormBuilder);

  sites   = signal<Site[]>([]);
  clients = signal<Client[]>([]);
  loading = signal(true);
  saving  = signal(false);
  showModal = signal(false);
  filter  = signal('');

  active = () => this.sites().filter(s => s.status === 'active').length;
  hold   = () => this.sites().filter(s => s.status === 'hold').length;
  done   = () => this.sites().filter(s => s.status === 'done').length;

  form = this.fb.group({
    name:      ['', Validators.required],
    city:      ['', Validators.required],
    clientId:  ['', Validators.required],
    startDate: [new Date().toISOString().split('T')[0]],
    budget:    [0],
    status:    ['active'],
    address:   [''],
  });

  sColor(s: string) { return { active:'#43e8a0', hold:'#ffa94d', done:'#6c63ff' }[s] ?? '#888'; }

  ngOnInit() { this.load(); this.clientSvc.getAll().subscribe(c => this.clients.set(c)); }

  load(status?: string) {
    this.loading.set(true);
    this.siteSvc.getAll(status).subscribe({
      next: s  => { this.sites.set(s); this.loading.set(false); },
      error: e => { this.toast.error(e.message); this.loading.set(false); }
    });
  }

  onFilter(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.load(v || undefined);
  }

  openModal() { this.showModal.set(true); }

  submitSite() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const v = this.form.value;
    this.siteSvc.create({
      clientId: +v.clientId!, name: v.name!, city: v.city!,
      address: v.address!, startDate: v.startDate!, budget: +v.budget!,
    }).subscribe({
      next: () => {
        this.saving.set(false); this.showModal.set(false);
        this.form.reset({ startDate: new Date().toISOString().split('T')[0], status:'active' });
        this.load(); this.toast.success('Site added ✓');
      },
      error: e => { this.saving.set(false); this.toast.error(e.message); }
    });
  }

  deleteSite(id: number) {
    if (!confirm('Delete this site?')) return;
    this.siteSvc.delete(id).subscribe({
      next: () => { this.load(); this.toast.success('Site deleted'); },
      error: e  => this.toast.error(e.message)
    });
  }
}
