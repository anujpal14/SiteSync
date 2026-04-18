// src/app/features/finance/finance.component.ts
import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { InvoiceService, ClientService, SiteService } from '../../data/services/api.service';
import { Invoice, Client, Site } from '../../data/models/models';
import { KpiCardComponent, PillComponent, ModalComponent, EmptyStateComponent, ToastService } from '../../shared/components/ui.components';
import { InrFormatPipe, SsDatePipe } from '../../shared/pipes/format.pipe';

@Component({
  selector: 'ss-finance',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, KpiCardComponent, PillComponent, ModalComponent, EmptyStateComponent, InrFormatPipe, SsDatePipe],
  template: `
    <div class="page-hd">
      <div><h1 class="page-title">Finance</h1><p class="page-sub">Budgets, invoices & payments</p></div>
      <button class="btn-primary" (click)="openAddModal()">+ New Invoice</button>
    </div>

    <div class="kpi-grid4" style="margin-bottom:20px">
      <ss-kpi [value]="total() | inrFormat"   label="Total Invoiced"  icon="receipt_long"            iconColor="#6c63ff"/>
      <ss-kpi [value]="paid()  | inrFormat"   label="Received"        icon="check_circle"            iconColor="#43e8a0" trend="Paid"   [trendUp]="true"/>
      <ss-kpi [value]="pend()  | inrFormat"   label="Outstanding"     icon="hourglass_empty"         iconColor="#ffa94d"/>
      <ss-kpi [value]="over()  | inrFormat"   label="Overdue"         icon="warning_amber"           iconColor="#ff6b6b" trend="Action" [trendUp]="false"/>
    </div>

    <div class="card">
      <div class="card-hd">
        <div class="card-title">Invoices ({{ invoices().length }})</div>
        <select class="filter-sel" (change)="onFilter($event)">
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      @if (loading()) {
        <div class="loading-rows">@for (i of [1,2,3]; track i){<div class="shimmer-row"></div>}</div>
      } @else if (invoices().length === 0) {
        <ss-empty emoji="💰" title="No invoices" subtitle="Create your first invoice" actionLabel="New Invoice" (action)="openAddModal()"/>
      } @else {
        <table class="ss-table">
          <thead><tr><th>Invoice #</th><th>Client</th><th>Site</th><th>Date</th><th>Amount</th><th>Status</th><th style="text-align:right">Action</th></tr></thead>
          <tbody>
            @for (inv of invoices(); track inv.id) {
              <tr>
                <td style="font-family:'Syne',sans-serif;font-size:12px;font-weight:700">{{ inv.invoiceNo }}</td>
                <td class="muted">{{ inv.clientName }}</td>
                <td class="muted">{{ inv.siteName || '—' }}</td>
                <td class="muted">{{ inv.createdAt | ssDate }}</td>
                <td style="font-weight:500">{{ inv.amount | inrFormat }}</td>
                <td><ss-pill [status]="inv.status"/></td>
                <td style="text-align:right">
                  @if (inv.status !== 'paid') {
                    <button class="btn-success-sm" (click)="markPaid(inv.id)">Mark Paid</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <ss-modal [open]="showModal()" title="New Invoice" (closed)="showModal.set(false)">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Client</label>
            <select class="form-input" formControlName="clientId">
              <option value="">Select Client</option>
              @for (c of clients(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
            </select>
          </div>
          <div class="form-row"><label class="form-label">Site (optional)</label>
            <select class="form-input" formControlName="siteId">
              <option value="">Select Site</option>
              @for (s of sites(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
            </select>
          </div>
          <div class="form-row"><label class="form-label">Amount (₹)</label>
            <input class="form-input" type="number" formControlName="amount" placeholder="e.g. 250000"/>
          </div>
          <div class="form-row"><label class="form-label">Due Date</label>
            <input class="form-input" type="date" formControlName="dueDate"/>
          </div>
        </div>
        <div class="form-row"><label class="form-label">Notes</label>
          <input class="form-input" formControlName="notes" placeholder="Optional notes"/>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-ghost" (click)="showModal.set(false)">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Create Invoice</button>
        </div>
      </form>
    </ss-modal>`,
  styles: [`:host{display:block}.page-hd{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}.page-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text)}.page-sub{font-size:12px;color:var(--muted);margin-top:3px}.kpi-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{background:var(--surface);border:0.5px solid var(--border);border-radius:14px;padding:20px}.card-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.card-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text)}.filter-sel{background:var(--surface2);border:0.5px solid var(--border);border-radius:8px;color:var(--text);padding:6px 10px;font-size:12px;outline:none}.btn-primary{background:var(--accent);color:#fff;border:none;border-radius:9px;padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer}.btn-primary:disabled{opacity:.5}.btn-ghost{background:var(--surface2);color:var(--text);border:0.5px solid var(--border);border-radius:9px;padding:9px 18px;font-size:13px;cursor:pointer}.btn-success-sm{background:rgba(67,232,160,.1);color:#43e8a0;border:0.5px solid rgba(67,232,160,.25);border-radius:7px;padding:5px 10px;font-size:11px;cursor:pointer}.ss-table{width:100%;border-collapse:collapse}.ss-table th{text-align:left;font-size:10px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:1px;padding:0 12px 10px;border-bottom:0.5px solid var(--border)}.ss-table td{padding:11px 12px;font-size:12.5px;border-bottom:0.5px solid var(--border);vertical-align:middle}.ss-table tr:last-child td{border-bottom:none}.ss-table tbody tr:hover td{background:rgba(255,255,255,.02)}.muted{color:var(--muted)!important}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}.form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}.form-label{font-size:10.5px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}.form-input{background:var(--surface2);border:0.5px solid var(--border);border-radius:9px;padding:9px 13px;color:var(--text);font-size:13px;outline:none;width:100%;box-sizing:border-box}.form-input:focus{border-color:var(--accent)}.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px;border-top:0.5px solid var(--border);padding-top:18px}.loading-rows{display:flex;flex-direction:column;gap:10px}.shimmer-row{height:44px;border-radius:8px;background:linear-gradient(90deg,var(--surface2) 25%,var(--surface3) 50%,var(--surface2) 75%);background-size:200%;animation:sh 1.4s infinite}@keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}`]
})
export class FinanceComponent implements OnInit {
  private invSvc    = inject(InvoiceService);
  private clientSvc = inject(ClientService);
  private siteSvc   = inject(SiteService);
  private toast     = inject(ToastService);
  private fb        = inject(FormBuilder);
  invoices  = signal<Invoice[]>([]);
  clients   = signal<Client[]>([]);
  sites     = signal<Site[]>([]);
  loading   = signal(true);
  showModal = signal(false);
  total = () => this.invoices().reduce((a,i) => a + i.amount, 0);
  paid  = () => this.invoices().filter(i => i.status==='paid').reduce((a,i) => a+i.amount, 0);
  pend  = () => this.invoices().filter(i => i.status!=='paid').reduce((a,i) => a+i.amount, 0);
  over  = () => this.invoices().filter(i => i.status==='overdue').reduce((a,i) => a+i.amount, 0);
  form = this.fb.group({
    clientId: ['', Validators.required], siteId: [''],
    amount: [null as number|null, [Validators.required, Validators.min(1)]],
    dueDate: [new Date(Date.now()+14*864e5).toISOString().split('T')[0], Validators.required],
    notes: ['']
  });
  ngOnInit() {
    this.load();
    this.clientSvc.getAll().subscribe(c => this.clients.set(c));
    this.siteSvc.getAll().subscribe(s => this.sites.set(s));
  }
  load(status?: string) { this.invSvc.getAll(status).subscribe({ next:i=>{this.invoices.set(i);this.loading.set(false)}, error:e=>{this.toast.error(e.message);this.loading.set(false)} }); }
  onFilter(e: Event) { const v=(e.target as HTMLSelectElement).value; this.loading.set(true); this.load(v||undefined); }
  openAddModal() { this.showModal.set(true); }
  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    this.invSvc.create({ clientId:+v.clientId!, siteId:v.siteId?+v.siteId!:undefined, amount:+v.amount!, dueDate:v.dueDate!, notes:v.notes! }).subscribe({
      next:()=>{this.showModal.set(false);this.form.reset();this.load();this.toast.success('Invoice created ✓')},
      error:e=>this.toast.error(e.message)
    });
  }
  markPaid(id:number) { this.invSvc.markPaid(id).subscribe({next:()=>{this.load();this.toast.success('Marked as paid ✓')},error:e=>this.toast.error(e.message)}); }
}
