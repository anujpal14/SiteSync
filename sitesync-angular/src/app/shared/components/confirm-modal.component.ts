import {
  Component,
  Injectable,
  inject,
  signal,
  ChangeDetectionStrategy,
} from "@angular/core";
import { CommonModule } from "@angular/common";

// ── Interface ────────────────────────────────────────────────────────────────
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

// ── Service ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class ConfirmService {
  isOpen = signal(false);
  options = signal<ConfirmOptions | null>(null);

  private resolveFn?: (confirmed: boolean) => void;

  open(opts: ConfirmOptions): Promise<boolean> {
    this.options.set(opts);
    this.isOpen.set(true);
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  confirm() {
    this.resolveFn?.(true);
    this.close();
  }
  cancel() {
    this.resolveFn?.(false);
    this.close();
  }

  private close() {
    this.isOpen.set(false);
    this.options.set(null);
    this.resolveFn = undefined;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: "ss-confirm-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (confirm.isOpen()) {
      <div class="overlay" (click)="confirm.cancel()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-icon" [class.danger]="confirm.options()?.danger">
            <span class="material-icon">
              {{
                confirm.options()?.danger ? "delete_forever" : "help_outline"
              }}
            </span>
          </div>

          <div class="modal-title">{{ confirm.options()?.title }}</div>
          <div class="modal-msg">{{ confirm.options()?.message }}</div>

          <div class="modal-actions">
            <button class="btn-ghost" (click)="confirm.cancel()">
              {{ confirm.options()?.cancelLabel ?? "Cancel" }}
            </button>
            <button
              class="btn-confirm"
              [class.danger]="confirm.options()?.danger"
              (click)="confirm.confirm()"
            >
              {{ confirm.options()?.confirmLabel ?? "Confirm" }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(3px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.15s ease;
        padding: 20px;
      }
      .modal {
        background: var(--surface);
        border: 0.5px solid var(--border);
        border-radius: 16px;
        padding: 28px 24px;
        width: 360px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        animation: slideUp 0.2s ease;
      }
      .modal-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: rgba(108, 99, 255, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;
      }
      .modal-icon .material-icon {
        font-size: 26px !important;
        color: var(--accent);
        font-family: "Material Symbols Outlined";
      }
      .modal-icon.danger {
        background: rgba(255, 107, 107, 0.12);
      }
      .modal-icon.danger .material-icon {
        color: #ff6b6b;
      }
      .modal-title {
        font-family: "Syne", sans-serif;
        font-size: 16px;
        font-weight: 700;
        color: var(--text);
      }
      .modal-msg {
        font-size: 13px;
        color: var(--muted);
        text-align: center;
        line-height: 1.6;
      }
      .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        width: 100%;
      }
      .btn-ghost {
        flex: 1;
        background: var(--surface2);
        color: var(--text);
        border: 0.5px solid var(--border);
        border-radius: 9px;
        padding: 10px;
        font-size: 13px;
        cursor: pointer;
      }
      .btn-confirm {
        flex: 1;
        background: var(--accent);
        color: #fff;
        border: none;
        border-radius: 9px;
        padding: 10px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .btn-confirm.danger {
        background: #ff6b6b;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class ConfirmModalComponent {
  confirm = inject(ConfirmService);
}
