import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { LS } from './keys';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);

  private users(): User[] {
    return this.storage.get<User[]>(LS.USERS, []);
  }
  private saveUsers(list: User[]) {
    this.storage.set(LS.USERS, list);
  }

  get current(): User | null {
    return this.storage.get<User | null>(LS.USER_CURRENT, null);
  }

  private hash(pwd: string) {
    return btoa(pwd); // DEMO solamente
  }

  register(name: string, email: string, password: string): { ok: boolean; msg?: string } {
    const users = this.users();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, msg: 'El email ya está registrado' };
    }
    const user: User = { id: crypto.randomUUID(), name, email, passwordHash: this.hash(password) };
    users.push(user);
    this.saveUsers(users);
    this.storage.set(LS.USER_CURRENT, user); // autologin
    return { ok: true };
  }

  login(email: string, password: string): { ok: boolean; msg?: string } {
    const users = this.users();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, msg: 'Usuario no encontrado' };
    if (user.passwordHash !== this.hash(password)) return { ok: false, msg: 'Contraseña incorrecta' };
    this.storage.set(LS.USER_CURRENT, user);
    return { ok: true };
  }

  logout(): void {
    this.storage.remove(LS.USER_CURRENT);
  }
}