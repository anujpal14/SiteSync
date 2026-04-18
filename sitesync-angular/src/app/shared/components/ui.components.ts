// src/app/shared/components/ui.components.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { InrFormatPipe, InitialsPipe, avatarColor, statusColor, statusLabel } from '../pipes/format.pipe';

// ── STATUS PILL ───────────────────────────────────────────
@Component({
  selector: 'ss-pill',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="pill" [style.background]="bg()" [style.color]="color()">
      {{ label() }}
    </span>`,
  styles: [`
    .pill { display:inline-flex; align-items:center; font-size:10.5px;
            font-weight:500; padding:3px 10px; border-radius:20px; }
  `]
})
export class PillComponent {
  @Input() status = '';
  color  = computed(() => statusColor(this.status));
  bg     = computed(() => statusColor(this.status) + '1f');
  label  = computed(() => statusLabel(this.status));
}

// ── AVATAR ────────────────────────────────────────────────
@Component({
  selector: 'ss-avatar',
  standalone: true,
  imports: [InitialsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="av" [style.width.px]="size" [style.height.px]="size"
         [style.background]="avatarColor(index)"
         [style.border-radius]="rounded ? size/2+'px' : '8px'"
         [style.font-size.px]="fontSize > 0 ? fontSize : size * 0.33">
      {{ name | initials }}
    </div>`,
  styles: [`.av{display:flex;align-items:center;justify-content:center;
             font-family:'Syne',sans-serif;font-weight:700;color:#fff;flex-shrink:0}`]
})
export class AvatarComponent {
  @Input() name = '';
  @Input() size = 34;
  @Input() index = 0;
  @Input() rounded = true;
  @Input() fontSize = 0;
  avatarColor = avatarColor;
}

// ── KPI CARD ─────────────────────────────────────────────
@Component({
  selector: 'ss-kpi',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-card">
      <div class="kpi-top">
        <div class="kpi-icon" [style.background]="iconColor + '26'">
          <span class="material-icon">{{ icon }}</span>
        </div>
        @if (trend) {
          <span class="trend" [class.up]="trendUp" [class.dn]="!trendUp">{{ trend }}</span>
        }
      </div>
      <div class="kpi-val">{{ value }}</div>
      <div class="kpi-lbl">{{ label }}</div>
    </div>`,
  styles: [`
    .kpi-card { background:var(--surface); border:0.5px solid var(--border);
      border-radius:14px; padding:18px 20px; display:flex; flex-direction:column; gap:12px;
      transition:border .2s, transform .2s; cursor:default; }
    .kpi-card:hover { border-color:var(--border2); transform:translateY(-2px); }
    .kpi-top { display:flex; align-items:center; justify-content:space-between; }
    .kpi-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; }
    .material-icon { font-size:17px; font-family:'Material Symbols Outlined'; }
    .trend { font-size:11px; font-weight:500; padding:2px 8px; border-radius:20px; }
    .trend.up { background:rgba(67,232,160,.1); color:#43e8a0; }
    .trend.dn { background:rgba(255,107,107,.1); color:#ff6b6b; }
    .kpi-val { font-family:'Syne',sans-serif; font-size:24px; font-weight:700; letter-spacing:-0.8px; color:var(--text); }
    .kpi-lbl { font-size:11.5px; color:var(--muted); }
  `]
})
export class KpiCardComponent {
  @Input() value = '';
  @Input() label = '';
  @Input() icon = '';
  @Input() iconColor = '#6c63ff';
  @Input() trend = '';
  @Input() trendUp = true;
}

// ── EMPTY STATE ───────────────────────────────────────────
@Component({
  selector: 'ss-empty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <div class="emoji">{{ emoji }}</div>
      <div class="title">{{ title }}</div>
      <div class="sub">{{ subtitle }}</div>
      @if (actionLabel) {
        <button class="btn-primary" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>`,
  styles: [`
    .empty { text-align:center; padding:60px 20px; }
    .emoji { font-size:48px; margin-bottom:14px; opacity:.6; }
    .title { font-family:'Syne',sans-serif; font-size:16px; font-weight:600; color:var(--text); margin-bottom:6px; }
    .sub { font-size:13px; color:var(--muted); max-width:280px; margin:0 auto 20px; }
    .btn-primary { background:var(--accent); color:#fff; border:none; border-radius:9px;
      padding:10px 20px; font-size:13px; font-weight:500; cursor:pointer; }
  `]
})
export class EmptyStateComponent {
  @Input() emoji = '📋';
  @Input() title = 'Nothing here';
  @Input() subtitle = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}

// ── PROGRESS BAR ─────────────────────────────────────────
@Component({
  selector: 'ss-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pw">
      <div class="track"><div class="fill" [style.width.%]="progress" [style.background]="barColor()"></div></div>
      <span class="pct">{{ progress }}%</span>
    </div>`,
  styles: [`
    .pw { display:flex; align-items:center; gap:7px; }
    .track { width:80px; height:5px; background:var(--surface2); border-radius:3px; overflow:hidden; }
    .fill { height:100%; border-radius:3px; transition:width .4s; }
    .pct { font-size:10.5px; color:var(--muted); }
  `]
})
export class ProgressBarComponent {
  @Input() progress = 0;
  @Input() status = 'active';
  barColor() {
    return { active:'#43e8a0', hold:'#ffa94d', done:'#6c63ff' }[this.status] ?? '#6c63ff';
  }
}

// ── MODAL SHELL ───────────────────────────────────────────
@Component({
  selector: 'ss-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="overlay" (click)="closeModal($event)">
        <div class="modal" role="dialog" [attr.aria-label]="title">
          <div class="modal-hd">
            <h2 class="modal-title">{{ title }}</h2>
            <button class="close-btn" (click)="closed.emit()" aria-label="Close">✕</button>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    }`,
  styles: [`
    .overlay { position:fixed; inset:0; background:rgba(0,0,0,.65); z-index:500;
      display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
    .modal { background:var(--surface); border:0.5px solid var(--border2); border-radius:14px;
      padding:28px; width:500px; max-width:95vw; max-height:90vh; overflow-y:auto;
      animation:fadeIn .2s ease; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    .modal-hd { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; }
    .modal-title { font-family:'Syne',sans-serif; font-size:17px; font-weight:700; color:var(--text); }
    .close-btn { background:none; border:none; color:var(--muted); font-size:16px; cursor:pointer;
      width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; }
    .close-btn:hover { background:var(--surface2); color:var(--text); }
  `]
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  closeModal(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) this.closed.emit();
  }
}

// ── TOAST SERVICE ─────────────────────────────────────────
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Toast { message: string; color: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toast$ = new Subject<Toast>();
  toast$ = this._toast$.asObservable();

  show(message: string, color = '#43e8a0') {
    this._toast$.next({ message, color });
  }
  success(msg: string) { this.show(msg, '#43e8a0'); }
  error(msg: string)   { this.show(msg, '#ff6b6b'); }
  info(msg: string)    { this.show(msg, '#6c63ff'); }
}
