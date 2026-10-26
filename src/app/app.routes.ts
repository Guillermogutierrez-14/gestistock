import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { invitadoGuard } from './core/guards/invitado.guard';

/**
 * Rutas de la aplicación GestiStock.
 * - Todas las páginas usan Lazy Loading (loadComponent): su código solo se
 *   descarga cuando el usuario navega a ellas.
 * - Las rutas están protegidas con Guards según el rol del usuario.
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    // Solo para usuarios SIN sesión iniciada
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    // Cualquier usuario con sesión (admin o usuario estándar)
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/productos/productos.page').then((m) => m.ProductosPage),
  },
  {
    // Solo administradores pueden dar de alta productos
    path: 'productos/nuevo',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/nuevo-producto/nuevo-producto.page').then((m) => m.NuevoProductoPage),
  },
  {
    // Cuadro de mando: solo administradores
    path: 'dashboard',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'ayuda',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ayuda/ayuda.page').then((m) => m.AyudaPage),
  },
  {
    // Cualquier ruta que no exista redirige al login
    path: '**',
    redirectTo: 'login',
  },
];
