import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  // ✅ getters para acceder en la plantilla
  get emailCtrl() {
    return this.form.get('email');
  }
  get passwordCtrl() {
    return this.form.get('password');
  }

  onSubmit() {
    if (this.form.invalid) return;
    console.log('LOGIN ->', this.form.value);
    alert('Login simulado. En el siguiente paso lo conectamos a localStorage.');
  }
}