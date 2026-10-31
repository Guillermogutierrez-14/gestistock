import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';
import { invitadoGuard } from './core/guards/invitado.guard';
import { cambiosSinGuardarGuard } from './core/guards/cambios-sin-guardar.guard';

/**
 * Rutas de la aplicación GestiStock.
 * - Todas las páginas usan Lazy Loading (loadComponent).
 * - Autenticación con canActivate (authGuard) y autorización por rol con
 *   canMatch (rolGuard): el chunk de una página de admin no se descarga si el rol no coincide.
 * - `data.roles` lo lee la estrategia de precarga PrecargaSegunRol.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    // Solo para usuarios SIN sesión iniciada
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  // ---- Rutas de ADMINISTRADOR (RBAC) ----
  {
    path: 'productos/nuevo',
    canMatch: [rolGuard('admin')],
    canDeactivate: [cambiosSinGuardarGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/nuevo-producto/nuevo-producto.page').then((m) => m.NuevoProductoPage),
  },
  {
    path: 'dashboard',
    canMatch: [rolGuard('admin')],
    data: { roles: ['admin'] },
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },

  // ---- Cualquier usuario autenticado ----
  {
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
    path: 'movimientos',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/movimientos/movimientos.page').then((m) => m.MovimientosPage),
  },
  {
    path: 'ayuda',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ayuda/ayuda.page').then((m) => m.AyudaPage),
  },

  // Cualquier ruta que no exista (o que canMatch haya rechazado) redirige al login
  { path: '**', redirectTo: 'login' },
];
