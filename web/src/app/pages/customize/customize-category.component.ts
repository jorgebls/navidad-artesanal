import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CustomizationService } from '../../core/services/customization.service';

interface CategoryCard {
  slug: string;
  name: string;
  description?: string | null;
  productCount: number;
}

@Component({
  selector: 'app-customize-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customize-category.component.html',
  styleUrls: ['./customize-category.component.scss'],
})
export class CustomizeCategoryComponent implements OnInit {
  private router = inject(Router);
  private customization = inject(CustomizationService);

  categories: CategoryCard[] = [];
  loading = true;
  error: string | null = null;

  async ngOnInit() {
    try {
      this.loading = true;
      const categories = await this.customization.getCategories();
      this.categories = categories.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        productCount: c.productCount,
      }));
    } catch (err) {
      console.error('Error cargando categorías personalizables', err);
      this.error = 'No fue posible cargar las categorías personalizables.';
    } finally {
      this.loading = false;
    }
  }

  navigate(slug: string) {
    this.router.navigate(['/personalizar', slug]);
  }
}
