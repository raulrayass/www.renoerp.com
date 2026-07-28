# GitHub Configuration & Workflow

Este documento establece la configuración profesional del repositorio y el flujo de trabajo estándar.

## Configuración del Repositorio

### Ramas Principales

- **main** - Rama de producción (protegida)
  - Deployments automáticos a producción
  - Requiere 1 aprobación de PR
  - Todos los tests deben pasar
  
- **develop** - Rama de desarrollo (protegida)
  - Staging/testing
  - Requiere 1 aprobación de PR
  - Base para feature branches

- **feature/*** - Ramas de características
  - Se crean desde `develop`
  - Se eliminan después del merge

### Protección de Ramas

**main:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Restrict who can push to matching branches (Admins only)
- ✅ Require branches to be up to date before merging

**develop:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

## Convenciones de Commits

### Formato

```
<tipo>(<alcance>): <descripción>

<cuerpo>

<pie>
```

### Tipos válidos

- **feat**: Nueva característica
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (sin lógica)
- **refactor**: Cambios de código sin nuevas features
- **perf**: Mejoras de performance
- **test**: Agregar o actualizar tests
- **chore**: Cambios en build, dependencias, etc

### Ejemplos

```
feat(events): agregar selector de eventos en sidebar
fix(auth): resolver issue de token expirado
docs: actualizar guía de instalación
```

## Flujo de Trabajo

### 1. Crear Feature

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo
```

### 2. Realizar Cambios

```bash
git add .
git commit -m "feat(modulo): descripción del cambio"
git push origin feature/nombre-descriptivo
```

### 3. Pull Request

- Crear PR contra `develop`
- Llenar template de PR con descripción clara
- Esperar aprobaciones
- Esperar que pasen todos los tests

### 4. Merge

```bash
# Después de aprobación
git checkout develop
git pull origin develop
git merge --no-ff feature/nombre-descriptivo
git push origin develop

# Eliminar rama
git push origin --delete feature/nombre-descriptivo
git branch -d feature/nombre-descriptivo
```

### 5. Release a Producción

```bash
# Desde develop
git checkout main
git pull origin main
git merge --no-ff develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

## Estándares de Código

### TypeScript

- ✅ Strict mode habilitado
- ✅ Sin `any` types sin justificación
- ✅ Tipos explícitos en funciones públicas

### React/Next.js

- ✅ Componentes funcionales
- ✅ Hooks en lugar de class components
- ✅ Naming: PascalCase para componentes, camelCase para variables
- ✅ Un componente por archivo

### Importaciones

```typescript
// ✅ Bueno: imports absolutas
import { Button } from '@/components/ui/button'

// ❌ Malo: imports relativas
import { Button } from '../../../ui/button'
```

## CI/CD

El repositorio utiliza GitHub Actions para:

- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Tests (si existen)
- ✅ Build verification
- ✅ Auto-deployment a producción en `main`

Ver `.github/workflows/` para configuración detallada.

## Cómo reportar Issues

### Título clara y conciso

```
[BUG] Selector de eventos no muestra correctamente en mobile
[FEATURE] Agregar exportación de datos en CSV
```

### Template a completar

1. **Descripción**: ¿Qué pasó?
2. **Pasos para reproducir**: Cómo lo viste?
3. **Comportamiento esperado**: ¿Qué debería pasar?
4. **Screenshots**: Si aplica
5. **Entorno**: Navegador, SO, etc

## Versionado Semántico

El proyecto sigue [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Cambios incompatibles
- **MINOR** (0.X.0): Nuevas características compatibles
- **PATCH** (0.0.X): Correcciones de bugs

Ejemplo: `v1.2.3`

## Mantenimiento

### Merge de `develop` a `main`

Se realiza cuando:
- ✅ Todas las features de la versión están completas
- ✅ Tests pasan
- ✅ Documentación actualizada
- ✅ Version bump realizado

### Limpieza de ramas

Se eliminan automáticamente después del merge:
- Feature branches completadas
- Ramas antiguas (> 30 días sin actividad)

## Contacto & Soporte

Para preguntas sobre el workflow o configuración, contactar al tech lead.

---

**Última actualización**: 2026-07-28  
**Responsable**: Development Team
