import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],  // 👈 añadir RouterLink
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;
  errorMsg = '';
  infoMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'timeout') {
      this.infoMsg = 'Tu sesión expiró por inactividad. Por favor vuelve a iniciar sesión.';
    }
  }

  get emailCtrl() { return this.form.get('email'); }
  get passwordCtrl() { return this.form.get('password'); }

  async onSubmit() {
    this.errorMsg = '';
    this.infoMsg = '';
    if (this.form.invalid) return;

    const { email, password } = this.form.value as { email: string; password: string };
    const res = await this.auth.login(email, password);
    if (!res.ok) {
      this.errorMsg = res.msg || 'Error al iniciar sesión';
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.router.navigateByUrl(returnUrl);
  }
}
