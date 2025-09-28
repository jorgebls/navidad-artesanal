import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('REGISTRO ->', this.form.value);
    alert('Registro simulado. En el siguiente paso lo conectamos a localStorage.');
  }
}