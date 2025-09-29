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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      documentId: ['', [Validators.required, Validators.minLength(5)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.errorMsg = '';
    if (this.form.invalid) return;

    const { firstName, lastName, email, phone, documentId, address, password, confirmPassword } = this.form.value as {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      documentId: string;
      address: string;
      password: string;
      confirmPassword: string;
    };

    if (password !== confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    const res = this.auth.register({
      firstName,
      lastName,
      email,
      phone,
      documentId,
      address,
      password
    });
    if (!res.ok) {
      this.errorMsg = res.msg || 'No se pudo registrar';
      return;
    }
    this.router.navigateByUrl('/');
  }
}
