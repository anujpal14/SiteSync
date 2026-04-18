// src/app/data/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, DashboardStats, Site, Client, Worker,
  Invoice, CreateSiteDto, CreateClientDto, CreateWorkerDto,
  CreateInvoiceDto, UpsertAttendanceDto
} from '../models/models';

const BASE = environment.apiUrl;

// ── GENERIC UNWRAP ────────────────────────────────────────
function unwrap<T>() {
  return map((res: ApiResponse<T>) => res.data);
}

// ════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  get(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${BASE}/dashboard`).pipe(unwrap());
  }
}

// ════════════════════════════════════════════════════════
// SITES
// ════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class SiteService {
  private http = inject(HttpClient);

  getAll(status?: string): Observable<Site[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<Site[]>>(`${BASE}/sites`, { params }).pipe(unwrap());
  }

  getById(id: number): Observable<Site> {
    return this.http.get<ApiResponse<Site>>(`${BASE}/sites/${id}`).pipe(unwrap());
  }

  create(dto: CreateSiteDto): Observable<Site> {
    return this.http.post<ApiResponse<Site>>(`${BASE}/sites`, dto).pipe(unwrap());
  }

  updateProgress(id: number, progress: number, status: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${BASE}/sites/${id}/progress`, { progress, status }).pipe(
      map(() => void 0)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/sites/${id}`).pipe(map(() => void 0));
  }
}

// ════════════════════════════════════════════════════════
// CLIENTS
// ════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class ClientService {
  private http = inject(HttpClient);

  getAll(): Observable<Client[]> {
    return this.http.get<ApiResponse<Client[]>>(`${BASE}/clients`).pipe(unwrap());
  }

  create(dto: CreateClientDto): Observable<Client> {
    return this.http.post<ApiResponse<Client>>(`${BASE}/clients`, dto).pipe(unwrap());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/clients/${id}`).pipe(map(() => void 0));
  }
}

// ════════════════════════════════════════════════════════
// WORKERS
// ════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class WorkerService {
  private http = inject(HttpClient);

  getAll(): Observable<Worker[]> {
    return this.http.get<ApiResponse<Worker[]>>(`${BASE}/workers`).pipe(unwrap());
  }

  create(dto: CreateWorkerDto): Observable<Worker> {
    return this.http.post<ApiResponse<Worker>>(`${BASE}/workers`, dto).pipe(unwrap());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/workers/${id}`).pipe(map(() => void 0));
  }
}

// ════════════════════════════════════════════════════════
// ATTENDANCE
// ════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);

  upsert(dto: UpsertAttendanceDto): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${BASE}/attendance`, dto).pipe(map(() => void 0));
  }

  markToday(workerId: number, siteId: number | undefined, status: 'present' | 'absent' | 'half-day'): Observable<void> {
    return this.upsert({
      workerId, siteId,
      date: new Date().toISOString(),
      status, hoursWorked: 8
    });
  }
}

// ════════════════════════════════════════════════════════
// INVOICES
// ════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private http = inject(HttpClient);

  getAll(status?: string): Observable<Invoice[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<Invoice[]>>(`${BASE}/invoices`, { params }).pipe(unwrap());
  }

  create(dto: CreateInvoiceDto): Observable<Invoice> {
    return this.http.post<ApiResponse<Invoice>>(`${BASE}/invoices`, dto).pipe(unwrap());
  }

  markPaid(id: number): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${BASE}/invoices/${id}/status`, {
      status: 'paid', paidDate: new Date().toISOString()
    }).pipe(map(() => void 0));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${BASE}/invoices/${id}`).pipe(map(() => void 0));
  }
}
