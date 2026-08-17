# Teneo Pet — Backoffice

Panel de administración para Teneo Pet, la app de salud de mascotas. Next.js 16 (App Router) + Supabase (Postgres, Auth, RLS, Storage), con RBAC granular por rol, auditoría en cada escritura, y todos los módulos operativos del negocio: tutores, mascotas, vacunas, desparasitación, notas clínicas, exámenes, calendario, notificaciones push, suscripciones, compartir mascota, catálogos, reportes y documentos.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Supabase**: Postgres + RLS, Auth (email/contraseña, sin OAuth), Storage, Edge Functions (Deno) para push
- **@base-ui/react** — primitivas headless (Select, Dialog, Menu), no shadcn's Radix wrapper
- **TanStack Table** — tablas server-driven (paginación/orden por query params, no client-state)
- **Tailwind v4**
- **Vitest** (unitarios) + **Playwright** (E2E)

## Empezar

```bash
npm install
cp .env.example .env.local   # completa los valores reales, ver comentarios en el archivo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige a `/login`.

## Scripts

| Comando            | Qué hace                           |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Servidor de desarrollo (Turbopack) |
| `npm run build`    | Build de producción                |
| `npm run start`    | Sirve el build de producción       |
| `npm run lint`     | ESLint                             |
| `npm run test`     | Tests unitarios (Vitest)           |
| `npm run test:e2e` | Tests E2E (Playwright) — ver abajo |
| `npm run format`   | Prettier sobre todo el repo        |

## Tests E2E

`e2e/` cubre los flujos críticos: login/logout, redirects de autenticación, y una pasada de humo sobre cada página del menú (usando el mismo listado real de `nav-items.ts`, no una lista duplicada a mano).

Necesitan una cuenta real del panel — no hay entorno de staging separado (ver `docs/deploy-checklist.md`), así que esto corre contra datos reales:

```bash
# En .env.local:
PLAYWRIGHT_TEST_EMAIL=tu-cuenta@ejemplo.com
PLAYWRIGHT_TEST_PASSWORD=tu-contraseña

npm run test:e2e
```

Sin esas variables, los tests que las necesitan se saltan solos (no fallan). `e2e/pets-crud.spec.ts` además escribe y borra una fila real — solo corre si pasas `E2E_ALLOW_WRITES=1` explícitamente, para que nunca se dispare por accidente.

Para correr contra un despliegue real en vez de levantar el servidor local:

```bash
PLAYWRIGHT_BASE_URL=https://tu-dominio.up.railway.app npm run test:e2e
```

## Despliegue

Desplegado en **Railway** (ver `docs/deploy-checklist.md` para el detalle de configuración manual — variables de entorno, Redirect URLs de Supabase Auth, secret de Firebase, etc., necesaria para que un despliegue nuevo funcione).

## Estructura

- `src/app/(panel)/` — todo el panel autenticado, un módulo por carpeta (Server Actions en `actions.ts`, formularios/tablas como Client Components)
- `src/app/login/`, `src/app/forgot-password/`, `src/app/reset-password/` — fuera del grupo `(panel)`, sin sidebar
- `src/lib/` — DAL de auth (`auth/dal.ts`), clientes de Supabase (`supabase/`), validaciones Zod (`validations/`), utilidades (`utils/`)
- `src/proxy.ts` — middleware (Next 16 renombró `middleware.ts`): sesión, RBAC de alto nivel, CSP con nonce
- `supabase/functions/` — Edge Function de notificaciones push (Deno, excluida del build de Next — ver `tsconfig.json`)
- `e2e/` — Playwright; `src/**/*.test.ts` — Vitest (junto a lo que prueban)

`docs/` (gaps, fases, propuestas de migración) es intencionalmente local — no se sube al repo.
