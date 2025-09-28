import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private svc = inject(ProductsService);
  products: Product[] = [];

  async ngOnInit() {
    await this.svc.seedIfEmpty();    
    this.products = this.svc.getAll();
    console.log('products:', this.products);
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'assets/img/images.jpg';
  }
}