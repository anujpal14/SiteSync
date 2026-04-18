// src/app/data/models/models.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── DASHBOARD ─────────────────────────────────────────────
export interface DashboardStats {
  activeSites: number;
  totalWorkers: number;
  totalClients: number;
  revenueThisMonth: number;
  presentToday: number;
  absentToday: number;
  pendingInvoices: number;
  totalBudget: number;
  recentSites: Site[];
  recentWorkers: Worker[];
  topClients: Client[];
  activities: ActivityLog[];
  monthlyRevenue: MonthlyRevenue[];
}

export interface ActivityLog {
  id: number;
  module: string;
  action: string;
  icon: string;
  timeAgo: string;
  createdAt: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

// ── SITE ─────────────────────────────────────────────────
export interface Site {
  id: number;
  clientId: number;
  clientName: string;
  name: string;
  city: string;
  address?: string;
  startDate: string;
  endDate?: string;
  budget: number;
  progress: number;
  status: 'active' | 'hold' | 'done';
  notes?: string;
  createdAt: string;
}

export interface CreateSiteDto {
  clientId: number;
  name: string;
  city: string;
  address?: string;
  startDate: string;
  endDate?: string;
  budget: number;
  notes?: string;
}

// ── CLIENT ────────────────────────────────────────────────
export interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  status: 'active' | 'inactive';
  siteCount: number;
  totalValue: number;
  createdAt: string;
}

export interface CreateClientDto {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
}

// ── WORKER ────────────────────────────────────────────────
export interface Worker {
  id: number;
  siteId?: number;
  siteName: string;
  siteCity: string;
  name: string;
  phone: string;
  role: string;
  dailyWage: number;
  city?: string;
  isActive: boolean;
  todayStatus: 'present' | 'absent' | 'half-day';
  createdAt: string;
}

export interface CreateWorkerDto {
  siteId?: number;
  name: string;
  phone: string;
  role: string;
  dailyWage: number;
  city?: string;
}

// ── ATTENDANCE ────────────────────────────────────────────
export interface UpsertAttendanceDto {
  workerId: number;
  siteId?: number;
  date: string;
  status: 'present' | 'absent' | 'half-day';
  hoursWorked?: number;
}

// ── INVOICE ──────────────────────────────────────────────
export interface Invoice {
  id: number;
  invoiceNo: string;
  clientId: number;
  clientName: string;
  siteId?: number;
  siteName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'sent' | 'paid' | 'pending' | 'overdue';
  notes?: string;
  createdAt: string;
}

export interface CreateInvoiceDto {
  clientId: number;
  siteId?: number;
  amount: number;
  dueDate: string;
  notes?: string;
}

// ── UTILS ─────────────────────────────────────────────────
export type SiteStatus    = 'active' | 'hold' | 'done';
export type InvoiceStatus = 'sent' | 'paid' | 'pending' | 'overdue';
export type AttendStatus  = 'present' | 'absent' | 'half-day';

export const WORKER_ROLES = ['Supervisor','Electrician','Carpenter','Painter','Plumber','Mason','Helper'];
