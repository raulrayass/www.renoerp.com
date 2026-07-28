# Guía de Contribución

¡Gracias por tu interés en contribuir a FinanzApp! Esta guía te ayudará a entender cómo colaborar de manera efectiva.

## Antes de Empezar

1. **Lee la documentación principal**: `/README.md` y `/ARCHITECTURE.md`
2. **Entiende el flujo de trabajo**: Ver `GITHUB_CONFIG.md`
3. **Familiarízate con el código**: Explora la estructura del proyecto

## Configuración Local

### Requisitos

- Node.js >= 18
- npm o pnpm
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/raulrayass/www.renoerp.com.git
cd www.renoerp.com

# Instalar dependencias
npm install
# o
pnpm install

# Crear rama de feature
git checkout develop
git checkout -b feature/mi-feature
```

### Ejecutar Localmente

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Linting
npm run lint

# Type checking
npm run type-check
```

## Proceso de Contribución

### 1. Crear Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/descripcion-clara
```

**Nombre de rama**: `feature/`, `fix/`, o `docs/`

### 2. Hacer Cambios

- Mantén commits pequeños y enfocados
- Escribe commits claros siguiendo el formato
- Actualiza tests si aplica

```bash
git add .
git commit -m "feat(modulo): descripción clara"
```

### 3. Push a GitHub

```bash
git push origin feature/mi-feature
```

### 4. Abrir Pull Request

- Ve a https://github.com/raulrayass/www.renoerp.com
- Abre un nuevo PR contra `develop`
- Completa el template del PR

**Template del PR:**

```markdown
## Descripción
Explica qué cambios hace este PR y por qué.

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Cambio que rompe compatibilidad
- [ ] Documentación

## Cómo se probó
Describe cómo probaste estos cambios.

## Screenshots (si aplica)
Agrega screenshots de cambios visuales.

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He actualizado la documentación
- [ ] He agregado tests (si aplica)
- [ ] Mis cambios no generan warnings nuevos
```

### 5. Revisión y Merge

- Espera al menos 1 aprobación
- Resuelve comentarios de revisión
- Actualiza a `develop` si hay conflictos

```bash
git fetch origin
git rebase origin/develop
git push origin feature/mi-feature --force-with-lease
```

- Una vez aprobado, merge automático o manual
- La rama se elimina automáticamente

## Estándares de Código

### TypeScript

```typescript
// ✅ Buenos tipos explícitos
export function getUserEvents(userId: string, eventId: number): Promise<Event[]> {
  // ...
}

// ❌ Evitar any
export function getUserEvents(userId: any, eventId: any) {
  // ...
}
```

### React Components

```typescript
// ✅ Componente funcional bien estructurado
export function EventSelector() {
  const { currentEventId } = useEventContext()
  const { events, isLoading } = useEvents()

  return (
    <div className="event-selector">
      {/* Component JSX */}
    </div>
  )
}

// ❌ Componentes sin estructura
function EventSelector() {
  // ...
}
```

### Imports

```typescript
// ✅ Importes organizados por grupo
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useEventContext } from '@/lib/contexts/event-context'
import { type Event } from '@/lib/db/schema'

// ❌ Imports desordenados
import type Event from '../../../schema'
import Button from '../button'
import { useRouter } from 'next/navigation'
```

## Pruebas

Si agregas nuevas funcionalidades:

```bash
# Ejecutar tests
npm run test

# Tests en watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Documentación

- Actualiza `README.md` si cambias la instalación o uso
- Documenta funciones públicas con JSDoc
- Agrega comentarios para lógica compleja

```typescript
/**
 * Obtiene todos los eventos del usuario
 * @param userId - ID del usuario
 * @returns Promise con array de eventos
 * @throws Error si el usuario no existe
 */
export async function getEvents(userId: string): Promise<Event[]> {
  // ...
}
```

## Resolución de Conflictos

Si tu rama tiene conflictos con `develop`:

```bash
# Actualizar tu rama
git fetch origin
git rebase origin/develop

# Si hay conflictos, resuelve manualmente, luego:
git add .
git rebase --continue

# Push con force-with-lease (seguro)
git push origin feature/mi-feature --force-with-lease
```

## Errores Comunes

### "Permission denied (publickey)"

```bash
# Agregar tu clave SSH a GitHub
ssh-keygen -t ed25519 -C "tu.email@example.com"
cat ~/.ssh/id_ed25519.pub  # Copiar y agregar a GitHub
```

### "Your branch is out of date"

```bash
git fetch origin
git rebase origin/develop
git push origin feature/mi-feature --force-with-lease
```

### "Merge conflict"

```bash
# Ver archivos en conflicto
git status

# Resolver manualmente en tu editor, luego:
git add .
git rebase --continue
```

## Preguntas & Ayuda

- 📖 **Documentación**: Ver `/docs` y `/README.md`
- 💬 **Discussions**: GitHub Discussions (si está habilitado)
- 📧 **Email**: Contactar al tech lead

## Código de Conducta

Todos los contributores deben seguir nuestro Código de Conducta:

- Sé respetuoso
- Sé constructivo
- Sé inclusivo
- No toleramos discriminación ni acoso

---

¡Gracias por contribuir a FinanzApp!

**Última actualización**: 2026-07-28
