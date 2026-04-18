// src/app/features/auth/login.component.ts
import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "ss-login",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo -->
        <div class="login-logo">
          <div class="logo-icon">SS</div>
          <div class="logo-text">Site<span>Sync</span></div>
        </div>
        <p class="login-sub">Interior Contractor Platform</p>

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <div class="form-row">
            <label class="form-label">Username</label>
            <input
              class="form-input"
              formControlName="username"
              placeholder="admin / supervisor / labour"
              autocomplete="username"
            />
          </div>

          <div class="form-row">
            <label class="form-label">Password</label>
            <div class="pw-wrap">
              <input
                class="form-input"
                formControlName="password"
                [type]="showPw() ? 'text' : 'password'"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="pw-toggle"
                (click)="showPw.update(v => !v)"
              >
                {{ showPw() ? "🙈" : "👁️" }}
              </button>
            </div>
          </div>

          @if (error()) {
            <div class="error-banner">⚠️ {{ error() }}</div>
          }

          <button
            type="submit"
            class="btn-login"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <span class="spinner"></span> Signing in…
            } @else {
              Sign In →
            }
          </button>
        </form>

        <!-- Demo credentials hint -->
        <div class="demo-creds">
          <div class="demo-title">Demo credentials</div>
          @for (cred of demoCreds; track cred.role) {
            <div class="demo-row" (click)="fillCred(cred)">
              <span class="demo-role" [style.color]="cred.color">{{
                cred.role
              }}</span>
              <span class="demo-info"
                >{{ cred.username }} / {{ cred.password }}</span
              >
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        background: var(--bg);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      .login-card {
        background: var(--surface);
        border: 0.5px solid var(--border2);
        border-radius: 18px;
        padding: 40px;
        width: 100%;
        max-width: 420px;
        animation: cardIn 0.3s ease;
      }

      @keyframes cardIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .login-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
      }

      .logo-icon {
        width: 38px;
        height: 38px;
        background: var(--accent);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Syne", sans-serif;
        font-weight: 800;
        font-size: 15px;
        color: #fff;
      }

      .logo-text {
        font-family: "Syne", sans-serif;
        font-weight: 700;
        font-size: 22px;
        color: var(--text);
      }

      .logo-text span {
        color: var(--accent);
      }

      .login-sub {
        font-size: 13px;
        color: var(--muted);
        margin-bottom: 32px;
        padding-left: 48px;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-size: 10.5px;
        font-weight: 500;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .pw-wrap {
        position: relative;
      }

      .form-input {
        width: 100%;
        background: var(--surface2);
        border: 0.5px solid var(--border);
        border-radius: 9px;
        padding: 11px 14px;
        color: var(--text);
        font-family: "DM Sans", sans-serif;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s;
        box-sizing: border-box;
      }

      .form-input:focus {
        border-color: var(--accent);
      }

      .pw-toggle {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        font-size: 14px;
        padding: 0;
      }

      .error-banner {
        background: rgba(255, 107, 107, 0.1);
        border: 0.5px solid rgba(255, 107, 107, 0.3);
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 12.5px;
        color: #ff6b6b;
      }

      .btn-login {
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 9px;
        padding: 13px;
        font-family: "DM Sans", sans-serif;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition:
          background 0.15s,
          transform 0.1s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-top: 4px;
      }

      .btn-login:hover:not(:disabled) {
        background: #5a52e0;
      }
      .btn-login:active:not(:disabled) {
        transform: scale(0.98);
      }
      .btn-login:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .demo-creds {
        margin-top: 28px;
        padding-top: 20px;
        border-top: 0.5px solid var(--border);
      }

      .demo-title {
        font-size: 10.5px;
        color: var(--muted2);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 10px;
      }

      .demo-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-radius: 7px;
        cursor: pointer;
        transition: background 0.1s;
        margin-bottom: 4px;
      }

      .demo-row:hover {
        background: var(--surface2);
      }

      .demo-role {
        font-size: 12px;
        font-weight: 500;
        min-width: 80px;
      }

      .demo-info {
        font-size: 11.5px;
        color: var(--muted);
        font-family: monospace;
      }
    `,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal("");
  showPw = signal(false);

  form = this.fb.group({
    username: ["", Validators.required],
    password: ["", Validators.required],
  });

  demoCreds = [
    {
      role: "Admin",
      username: "admin",
      password: "Admin@123",
      color: "#6c63ff",
    },
    {
      role: "Supervisor",
      username: "supervisor",
      password: "Super@123",
      color: "#4ecdc4",
    },
    {
      role: "Labour",
      username: "labour",
      password: "Labour@123",
      color: "#43e8a0",
    },
  ];

  fillCred(cred: { username: string; password: string }) {
    this.form.patchValue({ username: cred.username, password: cred.password });
    this.error.set("");
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set("");

    const { username, password } = this.form.value;

    this.auth.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(["/"]);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(
          e?.error?.message ?? "Invalid credentials. Please try again.",
        );
      },
    });
  }
}
