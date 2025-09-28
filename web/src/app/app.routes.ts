import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'catalogo', loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent) },
];