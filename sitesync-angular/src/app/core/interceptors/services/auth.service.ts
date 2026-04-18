// src/app/core/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient }   from '@angular/common/http';
import { Router }       from '@angular/router';
import { tap }          from 'rxjs';
import { environment }  from 'E:/SiteSync/sitesync-angular/src/environments/environment';
import { AuthUser, LoginRequest, LoginResponse, UserRole, ROLE_PERMISSIONS } from '../models/auth.models';
import { ApiResponse }  from 'E:/SiteSync/sitesync-angular/src/app/data/models/models';

const STORAGE_KEY = 'ss_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  // ── Signals ───────────────────────────────────────────
  private _user = signal<AuthUser | null>(this.loadFromStorage());

  readonly user       = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly role       = computed(() => this._user()?.role ?? null);
  readonly fullName   = computed(() => this._user()?.fullName ?? '');
  readonly token      = computed(() => this._user()?.token ?? '');

  // ── Login ─────────────────────────────────────────────
  login(req: LoginRequest) {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${environment.apiUrl}/auth/login`, req)
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            const user: AuthUser = {
              username: res.data.username,
              fullName: res.data.fullName,
              role:     res.data.role,
              token:    res.data.token,
              expires:  res.data.expires,
            };
            this._user.set(user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          }
        })
      );
  }

  // ── Logout ────────────────────────────────────────────
  logout() {
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  // ── Role checks ───────────────────────────────────────
  hasAccess(route: string): boolean {
    const r = this.role();
    if (!r) return false;
    return ROLE_PERMISSIONS[r].includes(route);
  }

  isAdmin()      { return this.role() === 'Admin'; }
  isSupervisor() { return this.role() === 'Supervisor'; }
  isLabour()     { return this.role() === 'Labour'; }

  // ── Token validity ────────────────────────────────────
  isTokenValid(): boolean {
    const u = this._user();
    if (!u) return false;
    return new Date(u.expires) > new Date();
  }

  // ── Restore from localStorage ─────────────────────────
  private loadFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const user: AuthUser = JSON.parse(raw);
      // Discard expired tokens
      if (new Date(user.expires) <= new Date()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}