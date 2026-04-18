// src/app/features/labour/labour.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { WorkerService, AttendanceService, SiteService } from '../../data/services/api.service';
import { Worker, Site, WORKER_ROLES } from '../../data/models/models';
import { AvatarComponent, KpiCardComponent, ModalComponent, EmptyStateComponent, ToastService } from '../../shared/components/ui.components';
import { InrFormatPipe } from '../../shared/pipes/format.pipe';

@Component({
  selector: 'ss-labour',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent, KpiCardComponent, ModalComponent, EmptyStateComponent, InrFormatPipe],
  template: `
    <div class="page-hd">
      <div><h1 class="page-title">Labour</h1><p class="page-sub">Workers, attendance & wages</p></div>
      <button class="btn-primary" (click)="showModal.set(true)">+ Add Worker</button>
    </div>

    <div class="kpi-grid3" style="margin-bottom:20px">
      <ss-kpi [value]="present().toString()" label="Present Today" icon="check_circle" iconColor="#43e8a0" trend="Today" [trendUp]="true"/>
      <ss-kpi [value]="absent().toString()"  label="Absent Today"  icon="cancel"        iconColor="#ff6b6b"/>
      <ss-kpi [value]="wages() | inrFormat"  label="Est. Monthly Wages" icon="payments" iconColor="#ffa94d"/>
    </div>

    <div class="card">
      <div class="card-hd"><div class="card-title">All Workers ({{ workers().length }})</div></div>
      @if (loading()) {
        <div class="loading-rows">@for (i of [1,2,3,4]; track i){<div class="shimmer-row"></div>}</div>
      } @else if (workers().length === 0) {
        <ss-empty emoji="👷" title="No workers" subtitle="Add workers and assign them to sites"
          actionLabel="Add Worker" (action)="showModal.set(true)"/>
      } @else {
        <table class="ss-table">
          <thead><tr><th>Name</th><th>Role</th><th>Site</th><th>City</th><th>Daily Wage</th><th>Today</th><th></th></tr></thead>
          <tbody>
            @for (w of workers(); track w.id; let i = $index) {
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:9px">
                    <ss-avatar [name]="w.name" [size]="28" [index]="i" [fontSize]="10"/>
                    <div>
                      <div style="font-weight:500">{{ w.name }}</div>
                      <div style="font-size:10.5px;color:var(--muted)">{{ w.phone }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="role-pill">{{ w.role }}</span></td>
                <td class="muted">{{ w.siteName || 'Unassigned' }}</td>
                <td class="muted">{{ w.siteCity || '—' }}</td>
                <td style="font-weight:500">₹{{ w.dailyWage.toLocaleString('en-IN') }}/day</td>
                <td>
                  <button class="att-btn" [class.present]="w.todayStatus==='present'" [class.absent]="w.todayStatus==='absent'"
                    (click)="toggleAttend(w)">
                    {{ w.todayStatus === 'present' ? '✓ Present' : '✗ Absent' }}
                  </button>
                </td>
                <td><button class="btn-danger-sm" (click)="del(w.id)">Delete</button></td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <ss-modal [open]="showModal()" title="Add New Worker" (closed)="showModal.set(false)">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Full Name</label><input class="form-input" formControlName="name" placeholder="e.g. Ravi Teja"/></div>
          <div class="form-row"><label class="form-label">Role</label>
            <select class="form-input" formControlName="role">
              @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
            </select>
          </div>
          <div class="form-row"><label class="form-label">Phone</label><input class="form-input" formControlName="phone" placeholder="+91 98765 43210"/></div>
          <div class="form-row"><label class="form-label">Daily Wage (₹)</label><input class="form-input" type="number" formControlName="dailyWage" placeholder="e.g. 800"/></div>
          <div class="form-row"><label class="form-label">Assign to Site</label>
            <select class="form-input" formControlName="siteId">
              <option value="">Select Site (optional)</option>
              @for (s of sites(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
            </select>
          </div>
          <div class="form-row"><label class="form-label">Today's Status</label>
            <select class="form-input" formControlName="todayStatus">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" (click)="showModal.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Add Worker</button>
        </div>
      </form>
    </ss-modal>`,
  styles: [`:host{display:block}.page-hd{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}.page-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text)}.page-sub{font-size:12px;color:var(--muted);margin-top:3px}.kpi-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:var(--surface);border:0.5px solid var(--border);border-radius:14px;padding:20px}.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.card-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text)}.btn-primary{background:var(--accent);color:#fff;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer}.btn-ghost{background:var(--surface2);color:var(--text);border:0.5px solid var(--border);border-radius:9px;padding:9px 18px;font-size:13px;cursor:pointer}.btn-danger-sm{background:rgba(255,107,107,.1);color:#ff6b6b;border:0.5px solid rgba(255,107,107,.2);border-radius:7px;padding:5px 10px;font-size:11px;cursor:pointer}.ss-table{width:100%;border-collapse:collapse}.ss-table th{text-align:left;font-size:10px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:1px;padding:0 12px 10px;border-bottom:0.5px solid var(--border)}.ss-table td{padding:11px 12px;font-size:12.5px;border-bottom:0.5px solid var(--border);vertical-align:middle}.ss-table tr:last-child td{border-bottom:none}.ss-table tbody tr:hover td{background:rgba(255,255,255,.02)}.muted{color:var(--muted)!important}.role-pill{background:rgba(108,99,255,.12);color:#6c63ff;border-radius:20px;padding:3px 9px;font-size:10.5px;font-weight:500}.att-btn{border:0.5px solid;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:500;cursor:pointer;transition:all .2s}.att-btn.present{background:rgba(67,232,160,.1);color:#43e8a0;border-color:rgba(67,232,160,.3)}.att-btn.absent{background:rgba(255,107,107,.1);color:#ff6b6b;border-color:rgba(255,107,107,.3)}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:0}.form-label{font-size:10.5px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}.form-input{background:var(--surface2);border:0.5px solid var(--border);border-radius:9px;padding:9px 13px;color:var(--text);font-size:13px;outline:none;width:100%;box-sizing:border-box}.form-input:focus{border-color:var(--accent)}.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px;border-top:0.5px solid var(--border);padding-top:18px}.loading-rows{display:flex;flex-direction:column;gap:10px}.shimmer-row{height:44px;border-radius:8px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:200%;animation:sh 1.4s infinite}@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`]
})
export class LabourComponent implements OnInit {
  private workerSvc  = inject(WorkerService);
  private attendSvc  = inject(AttendanceService);
  private siteSvc    = inject(SiteService);
  private toast      = inject(ToastService);
  private fb         = inject(FormBuilder);
  workers   = signal<Worker[]>([]);
  sites     = signal<Site[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  roles     = WORKER_ROLES;
  present   = () => this.workers().filter(w => w.todayStatus === 'present').length;
  absent    = () => this.workers().filter(w => w.todayStatus === 'absent').length;
  wages     = () => this.workers().reduce((a, w) => a + (w.todayStatus === 'present' ? w.dailyWage * 26 : 0), 0);
  form = this.fb.group({ name:['',Validators.required], role:['Supervisor'], phone:[''], dailyWage:[0], siteId:[''], todayStatus:['present'] });
  ngOnInit() { this.load(); this.siteSvc.getAll().subscribe(s => this.sites.set(s)); }
  load() { this.workerSvc.getAll().subscribe({ next:w=>{this.workers.set(w);this.loading.set(false)}, error:e=>{this.toast.error(e.message);this.loading.set(false)} }); }
  toggleAttend(w: Worker) {
    const next = w.todayStatus === 'present' ? 'absent' : 'present';
    this.attendSvc.markToday(w.id, w.siteId, next).subscribe({
      next: () => { this.workers.update(ws => ws.map(x => x.id === w.id ? { ...x, todayStatus: next } : x)); this.toast.success(`${w.name}: ${next}`); },
      error: e  => this.toast.error(e.message)
    });
  }
  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.workerSvc.create({ name:v.name!, phone:v.phone!, role:v.role!, dailyWage:+v.dailyWage!, siteId:v.siteId?+v.siteId!:undefined }).subscribe({
      next: worker => {
        this.attendSvc.markToday(worker.id, worker.siteId, v.todayStatus as any).subscribe();
        this.showModal.set(false); this.form.reset({ role:'Supervisor', todayStatus:'present' });
        this.load(); this.toast.success('Worker added ✓');
      },
      error: e => this.toast.error(e.message)
    });
  }
  del(id:number){ if(!confirm('Delete worker?')) return; this.workerSvc.delete(id).subscribe({next:()=>{this.load();this.toast.success('Deleted')},error:e=>this.toast.error(e.message)}); }
}
