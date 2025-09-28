import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router,RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form!: FormGroup;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.form.invalid) return;

    const { name, email, password, confirmPassword } = this.form.value as
      { name: string; email: string; password: string; confirmPassword: string };

    if (password !== confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    const res = this.auth.register(name, email, password);
    if (!res.ok) {
      this.errorMsg = res.msg || 'No se pudo registrar';
      return;
    }
    this.router.navigateByUrl('/');
  }
}