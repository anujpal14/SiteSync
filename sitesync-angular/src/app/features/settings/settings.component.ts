import {
  Component,
  signal,
  ChangeDetectionStrategy,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder } from "@angular/forms";
import { ToastService } from "../../shared/components/ui.components";

type SettingsTab = "profile" | "company" | "notifications" | "roles";

@Component({
  selector: "ss-settings",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<SettingsTab>("profile");

  tabs: { key: SettingsTab; label: string; icon: string }[] = [
    { key: "profile", label: "Profile", icon: "person" },
    { key: "company", label: "Company", icon: "business" },
    { key: "notifications", label: "Notifications", icon: "notifications" },
    { key: "roles", label: "Roles & Access", icon: "admin_panel_settings" },
  ];

  profileForm = this.fb.group({
    name: ["Rajesh Kumar"],
    phone: ["+91 98765 00001"],
    email: ["rajesh@sitesync.in"],
    city: ["Mumbai"],
  });

  companyForm = this.fb.group({
    companyName: ["RK Interiors Pvt Ltd"],
    gstin: ["27AABCU9603R1ZN"],
    city: ["Mumbai"],
    founded: ["2018"],
  });

  notifications = [
    {
      label: "Labour check-in alerts",
      sub: "Notify when a worker checks in",
      enabled: true,
    },
    {
      label: "Invoice due reminders",
      sub: "7 days before invoice due date",
      enabled: true,
    },
    {
      label: "Site progress updates",
      sub: "When progress crosses milestones",
      enabled: false,
    },
    {
      label: "Material shortage alerts",
      sub: "When a site reports material shortage",
      enabled: true,
    },
    {
      label: "Payment received",
      sub: "When an invoice is marked as paid",
      enabled: true,
    },
  ];

  roles = [
    { name: "Admin", desc: "Full access to all modules", color: "#6c63ff" },
    {
      name: "Supervisor",
      desc: "Sites, Labour, view Finance",
      color: "#4ecdc4",
    },
    { name: "Viewer", desc: "Read-only access to all data", color: "#43e8a0" },
  ];

  save(section: string) {
    this.toast.success(`${section} saved ✓`);
  }
}
