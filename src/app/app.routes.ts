import { Routes } from '@angular/router';

/**
 * Rutas de la aplicación GestiStock.
 * Todas las páginas usan Lazy Loading con loadComponent:
 * el código de cada página solo se descarga cuando el usuario navega a ella.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.page').then((m) => m.ProductosPage),
  },
  {
    path: 'productos/nuevo',
    loadComponent: () =>
      import('./pages/nuevo-producto/nuevo-producto.page').then((m) => m.NuevoProductoPage),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./pages/ayuda/ayuda.page').then((m) => m.AyudaPage),
  },
  {
    // Cualquier ruta que no exista redirige al login
    path: '**',
    redirectTo: 'login',
  },
];