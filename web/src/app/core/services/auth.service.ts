import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { LS } from './keys';
import { User } from '../../shared/models/user.model';

interface AuthSession {
  token: string;
  user: User;
}

interface AuthApiResponse {
  access_token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  private session = signal<AuthSession | null>(null);
  readonly userSignal = computed<User | null>(() => this.session()?.user ?? null);

  constructor() {
    const stored = this.storage.get<AuthSession | null>(LS.AUTH, null);
    if (stored) {
      this.session.set(stored);
      this.refreshProfile().catch(() => this.clearSession());
    }
  }

  get current(): User | null {
    return this.session()?.user ?? null;
  }

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.session();
  }

  async ensureSession(): Promise<boolean> {
    if (this.current) return true;
    if (this.token) {
      try {
        await this.refreshProfile();
        return !!this.current;
      } catch {
        return false;
      }
    }
    return false;
  }

  async register(payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    documentId: string;
    password: string;
  }): Promise<{ ok: boolean; msg?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthApiResponse>('/api/auth/register', payload),
      );
      this.setSession({ token: res.access_token, user: res.user });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, msg: this.extractErrorMessage(err) };
    }
  }

  async login(email: string, password: string): Promise<{ ok: boolean; msg?: string }> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthApiResponse>('/api/auth/login', { email, password }),
      );
      this.setSession({ token: res.access_token, user: res.user });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, msg: this.extractErrorMessage(err) };
    }
  }

  async refreshProfile(): Promise<void> {
    if (!this.token) return;
    try {
      const user = await firstValueFrom(this.http.get<User>('/api/auth/me'));
      const session = this.session();
      if (session) {
        this.setSession({ token: session.token, user });
      }
    } catch (err) {
      this.clearSession();
      throw err;
    }
  }

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    documentId?: string;
  }): Promise<{ ok: boolean; user?: User; msg?: string }> {
    try {
      const updated = await firstValueFrom(this.http.patch<User>('/api/user/me', payload));
      const session = this.session();
      if (session) {
        this.setSession({ token: session.token, user: updated });
      }
      return { ok: true, user: updated };
    } catch (err: any) {
      return { ok: false, msg: this.extractErrorMessage(err) };
    }
  }

  logout(): void {
    this.clearSession();
  }

  private setSession(session: AuthSession | null) {
    this.session.set(session);
    if (session) {
      this.storage.set(LS.AUTH, session);
    } else {
      this.storage.remove(LS.AUTH);
    }
  }

  private clearSession() {
    this.session.set(null);
    this.storage.remove(LS.AUTH);
  }

  private extractErrorMessage(err: any): string {
    const message = err?.error?.message ?? err?.message ?? 'Error inesperado';
    if (Array.isArray(message)) {
      return message[0];
    }
    return message;
  }
}
