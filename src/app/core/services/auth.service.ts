import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Perfil } from '../models/perfil.model';

/**
 * Servicio de autenticación (capa Modelo en MVVM).
 * - Inicia y cierra sesión con Supabase Auth, que devuelve un token JWT.
 * - Carga el rol del usuario desde la tabla `perfiles`.
 * - Expone el estado con Signals de solo lectura: solo este servicio puede
 *   modificarlo, por lo que el estado global es predecible.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly router = inject(Router);

  /** Estado privado (solo este servicio lo modifica) */
  private readonly sesion = signal<Session | null>(null);
  private readonly perfilActual = signal<Perfil | null>(null);

  /** Estado público de solo lectura */
  readonly perfil = this.perfilActual.asReadonly();
  readonly estaAutenticado = computed(() => this.sesion() !== null && this.perfilActual() !== null);
  readonly esAdmin = computed(() => this.perfilActual()?.rol === 'admin');

  /** Promesa que se resuelve cuando se ha comprobado si había una sesión guardada */
  private readonly inicializado: Promise<void> = this.restaurarSesion();

  constructor() {
    // Mantiene el token actualizado (Supabase lo renueva solo) y detecta cierres de sesión
    this.supabase.auth.onAuthStateChange((evento, sesion) => {
      this.sesion.set(sesion);
      if (evento === 'SIGNED_OUT') {
        this.perfilActual.set(null);
      }
    });
  }

  /** Los Guards esperan a esto antes de decidir si dejan pasar */
  esperarInicializacion(): Promise<void> {
    return this.inicializado;
  }

  /** Inicia sesión con email y contraseña. Lanza un error si falla. */
  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error('Email o contraseña incorrectos.');
    }
    this.sesion.set(data.session);
    try {
      await this.cargarPerfil(data.session.user.id);
    } catch (e) {
      await this.limpiarSesion();
      throw e;
    }
  }

  /** Cierra la sesión y vuelve al login */
  async logout(): Promise<void> {
    await this.limpiarSesion();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /** Token JWT del usuario actual (lo usa el interceptor HTTP) */
  getToken(): string | null {
    return this.sesion()?.access_token ?? null;
  }

  /** Al abrir la app, recupera la sesión guardada en el navegador (si la hay) */
  private async restaurarSesion(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getSession();
      if (data.session) {
        this.sesion.set(data.session);
        await this.cargarPerfil(data.session.user.id);
      }
    } catch {
      await this.limpiarSesion();
    }
  }

  /** Lee el perfil (y el rol) del usuario. La política RLS solo deja leer el propio. */
  private async cargarPerfil(id: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('id, nombre, email, rol')
      .eq('id', id)
      .single();
    if (error || !data) {
      throw new Error('Tu usuario no tiene un perfil asignado.');
    }
    this.perfilActual.set(data as Perfil);
  }

  private async limpiarSesion(): Promise<void> {
    await this.supabase.auth.signOut();
    this.sesion.set(null);
    this.perfilActual.set(null);
  }
}
