import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth.service";

@Component({
  selector: "ss-login",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class Login {
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
