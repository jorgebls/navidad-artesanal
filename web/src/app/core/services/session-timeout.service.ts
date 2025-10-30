import { Injectable, NgZone, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);

  private readonly timeoutMs = 15 * 60 * 1000;
  private listenersAttached = false;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private lastActivity = Date.now();

  constructor() {
    effect(() => {
      const user = this.auth.userSignal();
      if (user) {
        this.attachListeners();
        this.markActivity();
      } else {
        this.clearTimer();
      }
    });
  }

  private attachListeners() {
    if (this.listenersAttached) return;
    this.listenersAttached = true;
    const events: Array<keyof DocumentEventMap> = [
      'click',
      'mousemove',
      'keydown',
      'touchstart',
      'scroll',
    ];

    this.zone.runOutsideAngular(() => {
      const handler = this.handleActivity;
      events.forEach((event) => window.addEventListener(event, handler, { passive: true }));
      document.addEventListener('visibilitychange', this.handleVisibilityChange, { passive: true });
    });
  }

  private handleActivity = () => {
    if (!this.auth.isAuthenticated()) return;
    this.markActivity();
  };

  private handleVisibilityChange = () => {
    if (!document.hidden) {
      this.handleActivity();
    }
  };

  private markActivity() {
    this.lastActivity = Date.now();
    this.restartTimer();
  }

  private restartTimer() {
    this.clearTimer();
    this.timerId = window.setTimeout(() => {
      const inactive = Date.now() - this.lastActivity;
      if (inactive >= this.timeoutMs && this.auth.isAuthenticated()) {
        this.zone.run(() => this.handleTimeout());
      } else {
        this.restartTimer();
      }
    }, this.timeoutMs);
  }

  private clearTimer() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private handleTimeout() {
    this.clearTimer();
    this.auth.logout();
    this.router.navigate(['/login'], { queryParams: { reason: 'timeout' } });
  }
}

