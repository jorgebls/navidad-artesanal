import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private products = inject(ProductsService);

  product: Product | undefined;

  async ngOnInit() {
    await this.products.seedIfEmpty();
    const id = this.route.snapshot.paramMap.get('id')!;
    this.product = this.products.getById(id);
  }
}