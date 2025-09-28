import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snow-effect',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="snow-container"></div>',
  styles: [`
    .snow-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      pointer-events: none;
      z-index: 1000;
      overflow: hidden;
    }
  `]
})
export class SnowEffectComponent implements OnInit, OnDestroy {
  private snowInterval: any;

  ngOnInit() {
    this.startSnowEffect();
  }

  ngOnDestroy() {
    if (this.snowInterval) {
      clearInterval(this.snowInterval);
    }
  }

  private startSnowEffect() {
    this.snowInterval = setInterval(() => {
      this.createSnowflake();
    }, 300);
  }

  private createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.innerHTML = '❄';
    snowflake.style.position = 'fixed';
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.top = '-10px';
    snowflake.style.color = '#fff';
    snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
    snowflake.style.opacity = Math.random().toString();
    snowflake.style.animation = `snowfall ${Math.random() * 3 + 2}s linear infinite`;
    snowflake.style.pointerEvents = 'none';
    snowflake.style.zIndex = '1000';

    document.querySelector('.snow-container')?.appendChild(snowflake);

    setTimeout(() => {
      snowflake.remove();
    }, 5000);
  }
}
