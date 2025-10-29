import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  private readonly categories$ = this.http
    .get<Category[]>('/api/category')
    .pipe(
      map((categories) =>
        categories.map((c) => {
          const baseSlug = (c.slug ?? c.name ?? '').toString().toLowerCase();
          return { ...c, slug: baseSlug };
        }),
      ),
      shareReplay(1),
    );

  list(): Observable<Category[]> {
    return this.categories$;
  }
}
