import { Routes } from '@angular/router';
import { authGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'catalogo', loadComponent: () => import('./pages/catalog/catalog.component').then(m => m.CatalogComponent) },
  { path: 'producto/:id', loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
  { path: 'personalizar', loadComponent: () => import('./pages/customize/customize-category.component').then(m => m.CustomizeCategoryComponent) },
  { path: 'personalizar/:slug', loadComponent: () => import('./pages/customize/customize.component').then(m => m.CustomizeComponent) },
  { path: 'carrito', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },  // si ya la tienes creada
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'checkout/resumen', canActivate: [authGuard], loadComponent: () => import('./pages/checkout-summary/checkout-summary.component').then(m => m.CheckoutSummaryComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'registro', loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'perfil', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
];
