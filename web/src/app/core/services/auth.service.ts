import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { LS } from './keys';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private storage = inject(StorageService);

  private users(): User[] {
    const stored = this.storage.get<User[]>(LS.USERS, []);
    return stored.map(user => this.normalizeUser(user));
  }
  private saveUsers(list: User[]) {
    this.storage.set(LS.USERS, list.map(user => this.normalizeUser(user)));
  }

  get current(): User | null {
    const raw = this.storage.get<User | null>(LS.USER_CURRENT, null);
    return raw ? this.normalizeUser(raw) : null;
  }

  private hash(pwd: string) {
    return btoa(pwd); // DEMO solamente
  }

  register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentId: string;
    address: string;
    password: string;
  }): { ok: boolean; msg?: string } {
    const users = this.users();
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, msg: 'El email ya está registrado' };
    }
    const user: User = {
      id: crypto.randomUUID(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      documentId: data.documentId.trim(),
      address: data.address.trim(),
      passwordHash: this.hash(data.password)
    };
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

  private normalizeUser(raw: any): User {
    if (!raw) {
      return {
        id: crypto.randomUUID(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        documentId: '',
        address: '',
        passwordHash: ''
      };
    }

    const legacyName = typeof raw.name === 'string' ? raw.name : '';
    const [legacyFirst, ...legacyRest] = legacyName.split(' ').filter(Boolean);
    const legacyLast = legacyRest.join(' ');

    return {
      id: raw.id ?? crypto.randomUUID(),
      firstName: (raw.firstName ?? legacyFirst ?? '').toString(),
      lastName: (raw.lastName ?? legacyLast ?? '').toString(),
      email: (raw.email ?? '').toString(),
      phone: (raw.phone ?? '').toString(),
      documentId: (raw.documentId ?? '').toString(),
      address: (raw.address ?? '').toString(),
      passwordHash: (raw.passwordHash ?? '').toString()
    };
  }
}
