import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get emailCtrl() { return this.form.get('email'); }
  get passwordCtrl() { return this.form.get('password'); }

  onSubmit() {
    this.errorMsg = '';
    if (this.form.invalid) return;

    const { email, password } = this.form.value as { email: string; password: string };
    const res = this.auth.login(email, password);
    if (!res.ok) {
      this.errorMsg = res.msg || 'Error al iniciar sesión';
      return;
    }
    this.router.navigateByUrl('/'); // luego lo cambiaremos a /checkout si viene de compra
  }
}