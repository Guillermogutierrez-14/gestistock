import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { erroresSesionInterceptor } from './app/core/interceptors/errores-sesion.interceptor';
import { PrecargaSegunRol } from './app/core/routing/precarga-segun-rol';

// Formatos en español: 1.234,56 € (para los pipes currency y number)
registerLocaleData(localeEs, 'es-ES');

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-ES' },
    provideIonicAngular(),
    // Precarga solo las páginas que el rol del usuario puede abrir
    provideRouter(routes, withPreloading(PrecargaSegunRol), withComponentInputBinding()),
    // Cadena de interceptores (orden de la petición): errores de sesión → cabeceras JWT
    provideHttpClient(withInterceptors([erroresSesionInterceptor, authInterceptor])),
  ],
});
