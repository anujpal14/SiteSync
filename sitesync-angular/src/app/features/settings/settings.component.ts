// src/app/features/settings/settings.component.ts
import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToastService } from '../../shared/components/ui.components';

type SettingsTab = 'profile' | 'company' | 'notifications' | 'roles';

@Component({
  selector: 'ss-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page-hd">
      <div><h1 class="page-title">Settings</h1><p class="page-sub">Platform and account preferences</p></div>
    </div>

    <div class="settings-layout">
      <!-- Settings Nav -->
      <div class="settings-nav card">
        @for (tab of tabs; track tab.key) {
          <div class="settings-tab" [class.active]="activeTab() === tab.key"
               (click)="activeTab.set(tab.key)">
            <span class="material-icon tab-icon">{{ tab.icon }}</span>
            {{ tab.label }}
          </div>
        }
      </div>

      <!-- Settings Content -->
      <div class="settings-body card">
        @switch (activeTab()) {

          @case ('profile') {
            <div class="section-title">Profile</div>
            <form [formGroup]="profileForm" (ngSubmit)="save('Profile')" class="settings-form">
              <div class="form-grid">
                <div class="form-row">
                  <label class="form-label">Full Name</label>
                  <input class="form-input" formControlName="name"/>
                </div>
                <div class="form-row">
                  <label class="form-label">Phone</label>
                  <input class="form-input" formControlName="phone"/>
                </div>
                <div class="form-row">
                  <label class="form-label">Email</label>
                  <input class="form-input" formControlName="email"/>
                </div>
                <div class="form-row">
                  <label class="form-label">City</label>
                  <input class="form-input" formControlName="city"/>
                </div>
              </div>
              <button type="submit" class="btn-primary">Save Changes</button>
            </form>
          }

          @case ('company') {
            <div class="section-title">Company</div>
            <form [formGroup]="companyForm" (ngSubmit)="save('Company')" class="settings-form">
              <div class="form-grid">
                <div class="form-row">
                  <label class="form-label">Company Name</label>
                  <input class="form-input" formControlName="companyName"/>
                </div>
                <div class="form-row">
                  <label class="form-label">GSTIN</label>
                  <input class="form-input" formControlName="gstin"/>
                </div>
                <div class="form-row">
                  <label class="form-label">HQ City</label>
                  <input class="form-input" formControlName="city"/>
                </div>
                <div class="form-row">
                  <label class="form-label">Founded Year</label>
                  <input class="form-input" formControlName="founded"/>
                </div>
              </div>
              <button type="submit" class="btn-primary">Save Changes</button>
            </form>
          }

          @case ('notifications') {
            <div class="section-title">Notifications</div>
            @for (n of notifications; track n.label) {
              <div class="notif-row">
                <div class="notif-info">
                  <div class="notif-label">{{ n.label }}</div>
                  <div class="notif-sub">{{ n.sub }}</div>
                </div>
                <div class="toggle" [class.on]="n.enabled" (click)="n.enabled = !n.enabled; save('Notification')">
                  <div class="toggle-thumb"></div>
                </div>
              </div>
            }
          }

          @case ('roles') {
            <div class="section-title">Roles & Access</div>
            @for (role of roles; track role.name) {
              <div class="role-card">
                <div class="role-ic" [style.background]="role.color + '20'">
                  <span class="material-icon" [style.color]="role.color">person</span>
                </div>
                <div class="role-info">
                  <div class="role-name">{{ role.name }}</div>
                  <div class="role-desc">{{ role.desc }}</div>
                </div>
                <button class="btn-ghost-sm" (click)="save('Role')">Edit</button>
              </div>
            }
          }
        }
      </div>
    </div>
  `,
  styles: [`:host{display:block}
    .page-hd{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:22px}
    .page-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--text)}
    .page-sub{font-size:12px;color:var(--muted);margin-top:3px}
    .settings-layout{display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:start}
    .card{background:var(--surface);border:0.5px solid var(--border);border-radius:14px;padding:16px}
    .settings-nav{display:flex;flex-direction:column;gap:2px}
    .settings-tab{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:9px;
      font-size:13px;color:var(--muted);cursor:pointer;transition:all .15s}
    .settings-tab:hover{background:var(--surface2);color:var(--text)}
    .settings-tab.active{background:rgba(108,99,255,.13);color:var(--accent)}
    .tab-icon{font-size:16px!important;font-family:'Material Symbols Outlined'}
    .settings-body{padding:24px}
    .section-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:20px}
    .settings-form{display:flex;flex-direction:column;gap:0}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
    .form-row{display:flex;flex-direction:column;gap:6px}
    .form-label{font-size:10.5px;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
    .form-input{background:var(--surface2);border:0.5px solid var(--border);border-radius:9px;
      padding:9px 13px;color:var(--text);font-size:13px;outline:none;width:100%;box-sizing:border-box}
    .form-input:focus{border-color:var(--accent)}
    .btn-primary{background:var(--accent);color:#fff;border:none;border-radius:9px;
      padding:10px 20px;font-size:13px;font-weight:500;cursor:pointer;align-self:flex-start}
    .btn-ghost-sm{background:var(--surface2);color:var(--text);border:0.5px solid var(--border);
      border-radius:7px;padding:6px 14px;font-size:12px;cursor:pointer}
    .notif-row{display:flex;align-items:center;justify-content:space-between;
      padding:14px 0;border-bottom:0.5px solid var(--border)}
    .notif-row:last-child{border-bottom:none}
    .notif-label{font-size:13px;font-weight:500;color:var(--text)}
    .notif-sub{font-size:11.5px;color:var(--muted);margin-top:2px}
    .toggle{width:38px;height:22px;border-radius:11px;background:var(--surface2);
      cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
    .toggle.on{background:var(--accent)}
    .toggle-thumb{width:18px;height:18px;border-radius:50%;background:#fff;
      position:absolute;top:2px;left:2px;transition:left .2s}
    .toggle.on .toggle-thumb{left:18px}
    .role-card{display:flex;align-items:center;gap:14px;padding:14px;
      background:var(--surface2);border-radius:10px;border:0.5px solid var(--border);margin-bottom:10px}
    .role-ic{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .role-ic .material-icon{font-size:20px!important;font-family:'Material Symbols Outlined'}
    .role-name{font-size:13px;font-weight:500;color:var(--text)}
    .role-desc{font-size:11.5px;color:var(--muted);margin-top:2px}
    .role-info{flex:1}
    .material-icon{font-family:'Material Symbols Outlined';font-style:normal}
  `]
})
export class SettingsComponent {
  private toast = inject(ToastService);
  private fb    = inject(FormBuilder);

  activeTab = signal<SettingsTab>('profile');

  tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: 'profile',       label: 'Profile',        icon: 'person'        },
    { key: 'company',       label: 'Company',        icon: 'business'      },
    { key: 'notifications', label: 'Notifications',  icon: 'notifications' },
    { key: 'roles',         label: 'Roles & Access', icon: 'admin_panel_settings' },
  ];

  profileForm = this.fb.group({
    name:  ['Rajesh Kumar'],
    phone: ['+91 98765 00001'],
    email: ['rajesh@sitesync.in'],
    city:  ['Mumbai'],
  });

  companyForm = this.fb.group({
    companyName: ['RK Interiors Pvt Ltd'],
    gstin:       ['27AABCU9603R1ZN'],
    city:        ['Mumbai'],
    founded:     ['2018'],
  });

  notifications = [
    { label: 'Labour check-in alerts',   sub: 'Notify when a worker checks in',         enabled: true  },
    { label: 'Invoice due reminders',    sub: '7 days before invoice due date',          enabled: true  },
    { label: 'Site progress updates',    sub: 'When progress crosses milestones',        enabled: false },
    { label: 'Material shortage alerts', sub: 'When a site reports material shortage',   enabled: true  },
    { label: 'Payment received',         sub: 'When an invoice is marked as paid',       enabled: true  },
  ];

  roles = [
    { name: 'Admin',      desc: 'Full access to all modules', color: '#6c63ff' },
    { name: 'Supervisor', desc: 'Sites, Labour, view Finance', color: '#4ecdc4' },
    { name: 'Viewer',     desc: 'Read-only access to all data', color: '#43e8a0' },
  ];

  save(section: string) {
    this.toast.success(`${section} saved ✓`);
  }
}
