import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'catalogo', loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'producto/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'carrito', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },  // si ya la tienes creada
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'perfil', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
];