# Estructura del Proyecto

Guía completa de la organización y arquitectura de FinanzApp.

## Estructura General

```
www.renoerp.com/
├── app/                      # Next.js App Router
├── components/               # React components reutilizables
├── lib/                       # Utilidades y configuración
├── public/                    # Archivos estáticos
├── docs/                      # Documentación adicional
├── .github/                   # GitHub workflows y config
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## `/app` - Estructura de Rutas

```
app/
├── layout.tsx                 # Layout raíz
├── page.tsx                   # Página principal
├── auth/                      # Rutas de autenticación
│   ├── layout.tsx
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── forgot-password/page.tsx
├── dashboard/                 # Dashboard principal
│   ├── layout.tsx
│   ├── page.tsx
│   ├── teams/
│   ├── attendees/
│   ├── games/
│   └── transactions/
├── events/                    # Gestión de eventos
│   ├── layout.tsx
│   └── new/page.tsx
├── api/                       # API routes
│   └── [...]/route.ts
└── actions/                   # Server Actions
    ├── attendees.ts
    ├── games.ts
    ├── teams.ts
    └── events.ts
```

## `/components` - Componentes

```
components/
├── ui/                        # Componentes UI reutilizables
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── ...
├── auth/                      # Componentes de autenticación
│   └── auth-form.tsx
├── layout/                    # Componentes de layout
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── footer.tsx
├── dashboard/                 # Componentes del dashboard
│   ├── stats-bar.tsx
│   └── dashboard-stats.tsx
├── teams/                     # Componentes de equipos
│   ├── teams-client.tsx
│   └── team-flag.tsx
├── attendees/                 # Componentes de camperos
│   └── attendees-client.tsx
├── games/                     # Componentes de juegos
│   ├── games-client.tsx
│   ├── scoreboard-fullscreen.tsx
│   └── podium-fullscreen.tsx
├── events/                    # Componentes de eventos
│   ├── event-selector.tsx
│   └── create-event-form.tsx
└── other/
    ├── user-provider.tsx
    ├── loading-screen.tsx
    └── mobile.tsx
```

## `/lib` - Utilidades y Contexto

```
lib/
├── auth-client.ts             # Cliente de autenticación
├── utils.ts                   # Utilidades generales
├── countries.ts               # Lista de países
├── country-flags-svg.ts       # SVGs de banderas
├── db/
│   ├── schema.ts              # Definición de tablas (Drizzle ORM)
│   └── index.ts               # Conexión a BD
├── hooks/                     # React Hooks personalizados
│   ├── index.ts
│   ├── useTeams.ts
│   ├── useAttendees.ts
│   ├── useGames.ts
│   ├── useGameScores.ts
│   ├── useEvents.ts
│   ├── useDashboardStats.ts
│   └── useMediaQuery.ts
├── contexts/                  # React Contexts
│   └── event-context.tsx      # Contexto de evento actual
└── db-utils.ts                # Utilidades de BD
```

## Modelos de Datos

### Tablas Principales (Neon PostgreSQL)

```
📊 DATABASE SCHEMA

users
├── id (primary key)
├── email
├── name
└── createdAt

events
├── id (primary key)
├── userId (foreign key → users)
├── name
├── startDate
├── endDate
└── location

attendees
├── id (primary key)
├── eventId (foreign key → events)
├── name
├── phone
├── church
└── ...

teams
├── id (primary key)
├── eventId (foreign key → events)
├── name
├── color
└── country

games
├── id (primary key)
├── eventId (foreign key → events)
├── name
└── gameDate

game_scores
├── id (primary key)
├── gameId (foreign key → games)
├── teamId (foreign key → teams)
├── points
└── eventId

transactions
├── id (primary key)
├── eventId (foreign key → events)
├── type
├── amount
└── date
```

## Flujo de Datos

```
┌─────────────────────────────────────────────┐
│         Cliente React (Browser)             │
│  ┌──────────────────────────────────────┐  │
│  │     Components (UI)                  │  │
│  │  - teams-client.tsx                  │  │
│  │  - attendees-client.tsx              │  │
│  │  - event-selector.tsx                │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │     Hooks (State Management)         │  │
│  │  - useTeams()                        │  │
│  │  - useAttendees()                    │  │
│  │  - useEventContext()                 │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
└─────────────────┼───────────────────────────┘
                  │
                  ▼ (fetch/action call)
┌─────────────────────────────────────────────┐
│    Next.js Server (Node.js Runtime)         │
│  ┌──────────────────────────────────────┐  │
│  │  Server Actions (app/actions)        │  │
│  │  - getTeams(userId, eventId)         │  │
│  │  - createAttendee(userId, eventId)   │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │     Database (Neon PostgreSQL)       │  │
│  │  - Tables con filtro eventId         │  │
│  │  - Row-level security (opcional)     │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Sistema Multi-Evento

### Cómo Funciona

1. **Selección de Evento**: Usuario elige evento en el EventSelector
2. **Context**: EventContext obtiene eventId de URL query params
3. **Hooks**: useTeams(), useAttendees(), etc. leen eventId del context
4. **Filtrado**: Server actions reciben eventId y filtran datos
5. **Aislamiento**: Cada usuario solo ve sus eventos

### URL Pattern

```
/dashboard/teams?eventId=123
/dashboard/attendees?eventId=456
/events/new
```

### EventContext

```typescript
// Proporciona eventId a toda la app
const { currentEventId } = useEventContext()

// Lógica en hooks
useEffect(() => {
  if (!currentEventId) return
  loadData(currentEventId)
}, [currentEventId])
```

## Convenciones de Código

### Nombres de Archivos

- **Componentes**: `PascalCase` → `teams-client.tsx`
- **Hooks**: `camelCase` → `useTeams.ts`
- **Utilidades**: `camelCase` → `db-utils.ts`
- **Types**: `PascalCase` en el archivo

### Imports

```typescript
// 1. Librerías de React/Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. UI Components
import { Button } from '@/components/ui/button'

// 3. Custom Components
import { EventSelector } from '@/components/event-selector'

// 4. Hooks
import { useTeams } from '@/lib/hooks'

// 5. Types & Utilities
import { type Event } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
```

### Componentes

```typescript
// ✅ Estructura recomendada
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export interface TeamsClientProps {
  userId: string
}

export function TeamsClient({ userId }: TeamsClientProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(!isOpen)}>
        Toggle
      </Button>
    </div>
  )
}
```

## Performance

### Optimizaciones Implementadas

- ✅ Server Components donde sea posible
- ✅ Lazy loading de componentes
- ✅ Image optimization (next/image)
- ✅ CSS-in-JS (Tailwind)
- ✅ SWR para data fetching

### Caching Strategy

- **Datos estáticos**: 60 segundos
- **Datos de usuario**: 30 segundos
- **Listados**: 45 segundos

## Testing

```bash
# Tests unitarios
npm run test

# Tests en watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests (si existen)
npm run test:e2e
```

## Linting & Formatting

```bash
# ESLint
npm run lint

# TypeScript check
npm run type-check

# Prettier (si está configurado)
npm run format
```

## Deployment

### Staging

Push a `develop` → Deploy automático a staging

### Producción

Merge a `main` → Deploy automático a producción

Ver `.github/workflows/` para configuración detallada.

---

**Última actualización**: 2026-07-28  
**Responsable**: Development Team
