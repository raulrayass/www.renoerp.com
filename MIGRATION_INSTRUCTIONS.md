# Migración a Arquitectura Multi-Evento

## Contexto
La app ha sido actualizada para soportar **múltiples campamentos/eventos** en lugar de solo uno. Este documento explica cómo ejecutar la migración sin perder datos.

---

## ¿Qué sucede en la migración?

### ANTES (Single-Event)
```
Usuario Juan
  ├─ 5 Equipos
  ├─ 150 Asistentes
  ├─ 30 Transacciones
  └─ 2 Juegos
```

### DESPUÉS (Multi-Event)
```
Usuario Juan
  └─ Evento: "Campamento Default" (Rol: admin)
      ├─ 5 Equipos
      ├─ 150 Asistentes
      ├─ 30 Transacciones
      └─ 2 Juegos
```

**Todos los datos quedan intactos**, solo están ahora vinculados a un evento "Default".

---

## Pasos de Migración

### 1. Respaldar BD (IMPORTANTE)
```bash
# Tomar snapshot de la BD actual antes de hacer cambios
pg_dump $DATABASE_URL > backup_antes_migracion.sql
```

### 2. Ejecutar Migration Script
```bash
npx ts-node scripts/migrate-to-multi-event.ts
```

**Output esperado:**
```
🚀 Starting migration to multi-event architecture...

📋 Step 1: Fetching all users...
✓ Found 5 users

👤 Processing user: juan@gmail.com
  ✓ Created Default event (ID: 1)
  ✓ Added user as admin to event
  ✓ Linked 5 teams
  ✓ Linked 150 attendees
  ✓ Linked 30 transactions
  ✓ Linked 2 games
  ...

✅ Migration completed successfully!
📊 Summary:
   - Events created: 5
   - Data records linked: 2,847
   - Users migrated: 5

✨ All data has been preserved and linked to Default events!
```

### 3. Verificar Integridad
```bash
# Contar datos por usuario (debe coincidir con ANTES)
SELECT userId, COUNT(*) as total FROM teams GROUP BY userId;
```

---

## Verificación Post-Migración

### ✅ Checklist

- [ ] Script ejecutado sin errores
- [ ] Número de usuarios = número de eventos creados
- [ ] Cada usuario tiene rol "admin" en su evento Default
- [ ] Todos los equipos vinculados a un evento
- [ ] Todos los asistentes vinculados a un evento
- [ ] Todas las transacciones vinculadas a un evento
- [ ] No hay datos "huérfanos" (sin eventId)

### 🔍 Consultas SQL para verificar

```sql
-- 1. Verificar que no hay teams sin eventId
SELECT COUNT(*) FROM teams WHERE eventId IS NULL;
-- Resultado esperado: 0

-- 2. Verificar que cada usuario tiene un evento Default
SELECT COUNT(DISTINCT adminId) FROM events 
WHERE name = 'Campamento Default';
-- Resultado esperado: (mismo que número de usuarios)

-- 3. Verificar distribución de datos
SELECT eventId, COUNT(*) as total FROM teams GROUP BY eventId;
SELECT eventId, COUNT(*) as total FROM attendees GROUP BY eventId;
```

---

## Si algo sale mal

### ❌ Script falló
```bash
# 1. Restaurar BD desde backup
psql $DATABASE_URL < backup_antes_migracion.sql

# 2. Investigar error en logs
# 3. Verificar conectividad con BD
```

### ❌ Datos inconsistentes después
```bash
# 1. Restaurar BD desde backup
psql $DATABASE_URL < backup_antes_migracion.sql

# 2. Ejecutar script nuevamente
npx ts-node scripts/migrate-to-multi-event.ts
```

---

## Próximos Pasos (Después de migración)

### Fase 2: Actualizar Hooks
Todos los hooks deben filtrar por `eventId`:

```typescript
// ANTES
const teams = await db.select().from(schema.teams)
  .where(eq(schema.teams.userId, userId))

// DESPUÉS
const teams = await db.select().from(schema.teams)
  .where(and(
    eq(schema.teams.userId, userId),
    eq(schema.teams.eventId, eventId)  // ← NUEVO
  ))
```

### Fase 3: UI
- Crear selector de eventos en header
- Página "Crear Evento"
- Página "Invitar Miembros"

---

## Soporte

Si tienes dudas durante la migración, contacta al equipo de desarrollo.

**Garantía**: Esta migración preserva **100% de los datos**. Ningún registro será eliminado.
