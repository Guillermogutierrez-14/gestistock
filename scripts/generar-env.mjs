/**
 * Genera src/environments/env.generated.ts a partir de variables de entorno.
 * - En local: las lee del archivo .env (que NO se sube a Git).
 * - En Vercel: las lee de las "Environment Variables" del proyecto.
 * Así las claves nunca quedan escritas en el repositorio público.
 */
import { writeFileSync } from 'node:fs';

try {
  process.loadEnvFile(); // Carga el archivo .env si existe (Node 20.12+)
} catch {
  // No hay .env (por ejemplo en Vercel): se usan las variables del sistema
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key) {
  console.warn('⚠️  Faltan SUPABASE_URL o SUPABASE_KEY. Se usarán valores de ejemplo.');
}

const contenido = `// ARCHIVO GENERADO AUTOMÁTICAMENTE por scripts/generar-env.mjs
// NO EDITAR Y NO SUBIR A GIT
export const supabaseEnv = {
  supabaseUrl: ${JSON.stringify(url ?? 'https://ejemplo.supabase.co')},
  supabaseKey: ${JSON.stringify(key ?? 'clave-de-ejemplo')},
};
`;

writeFileSync('src/environments/env.generated.ts', contenido);
console.log('✅ src/environments/env.generated.ts generado');