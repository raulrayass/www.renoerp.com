# userId Flow Diagram - Visual Analysis

## CURRENT STATE (TODAY)

### 1. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER LOGS IN WITH GOOGLE               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Better Auth Handler       │
              │  /api/auth/[...all]/route │
              │                            │
              │  Creates:                  │
              │  - Table `user`            │
              │  - user.id = UUID          │
              └────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        ┌──────────────┐        ┌─────────────────┐
        │ Session      │        │ Calls           │
        │ user.id=UUID │        │ getOrCreateUser │
        │ user.email   │        │ (app/user.ts)   │
        └──────────────┘        └────────┬────────┘
              │                          │
              │                          ▼
              │                   ┌──────────────────┐
              │                   │ Creates in       │
              │                   │ app_users table  │
              │                   │ id = NANOID ❌   │
              │                   │ email = same     │
              │                   └──────────────────┘
              │
        ┌─────┴──────────────────────────────────┐
        │  Result: TWO UNLINKED RECORDS          │
        │                                        │
        │  Table `user` (Better Auth):           │
        │    id: "uuid-abc-def"                  │
        │    email: "user@gmail.com"             │
        │                                        │
        │  Table `app_users` (Custom):           │
        │    id: "nanoid-123-xyz"                │
        │    email: "user@gmail.com"             │
        │                                        │
        │  ⚠️ INCONSISTENCY CREATED              │
        └────────────────────────────────────────┘
```

---

### 2. Request Flow in Components

#### PATTERN A: Client Components (Attendees, Categories, Staff, etc)

```
┌──────────────────────────────────────────────┐
│ attendees/page.tsx                           │
│ 'use client'                                 │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ const { user } = useUser()                   │
│                                              │
│ UserProvider → useSession() →               │
│   session.user.id (Better Auth UUID)        │
└────────────┬─────────────────────────────────┘
             │
             ▼ user.id = "uuid-abc-def"
┌──────────────────────────────────────────────┐
│ <AttendeesClient userId={user.id} />         │
│                                              │
│ Pass to client component                     │
└────────────┬─────────────────────────────────┘
             │
             ▼ userId = "uuid-abc-def"
┌──────────────────────────────────────────────┐
│ attendees-client.tsx                         │
│                                              │
│ onClick → createAttendee(userId, data)       │
└────────────┬─────────────────────────────────┘
             │
             ▼ Call Server Action
┌──────────────────────────────────────────────┐
│ app/actions/attendees.ts                     │
│                                              │
│ export async function createAttendee(        │
│   userId: string,  ← "uuid-abc-def"         │
│   data: {...}                                │
│ )                                            │
│                                              │
│ db.insert(attendees).values({                │
│   userId,  ← STORES "uuid-abc-def"          │
│   ...data                                    │
│ })                                           │
└──────────────────────────────────────────────┘
             │
             ▼
   ✅ DATA STORED WITH CORRECT UUID
```

#### PATTERN B: Server Components (Games, Teams, Rooms)

```
┌──────────────────────────────────────────────┐
│ games/page.tsx (Server Component)            │
│ import { auth } from '@/lib/auth'            │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ const session =                              │
│   await auth.api.getSession({                │
│     headers: await headers()                 │
│   })                                         │
│                                              │
│ session.user.id = "uuid-abc-def"            │
└────────────┬─────────────────────────────────┘
             │
             ▼ userId = "uuid-abc-def"
┌──────────────────────────────────────────────┐
│ <GamesClient userId={session.user.id} />     │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ games-client.tsx                             │
│                                              │
│ onClick → addGameScore(userId, ...)          │
└────────────┬─────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────┐
│ app/actions/games.ts                         │
│                                              │
│ export async function addGameScore(          │
│   userId: string,  ← "uuid-abc-def"         │
│   ...                                        │
│ )                                            │
│                                              │
│ db.insert(gameScores).values({               │
│   userId,  ← STORES "uuid-abc-def"          │
│   ...                                        │
│ })                                           │
└──────────────────────────────────────────────┘
             │
             ▼
   ✅ DATA STORED WITH CORRECT UUID
```

---

### 3. Database State

```
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRES DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TABLE: user (Better Auth)                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id                     │ email              │ name      │ │
│  ├────────────────────────┼────────────────────┼───────────┤ │
│  │ aaaa-bbbb-cccc-dddd   │ user@gmail.com    │ John Doe  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  TABLE: app_users (Custom - UNUSED)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id                 │ email              │ name         │ │
│  ├────────────────────┼────────────────────┼──────────────┤ │
│  │ nanoid-123-xyz     │ user@gmail.com    │ NULL         │ │
│  └────────────────────────────────────────────────────────┘ │
│  ❌ ORPHANED - Not linked to anything                      │
│                                                              │
│  TABLE: attendees                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id │ userId             │ name     │ ...              │ │
│  ├────┼────────────────────┼──────────┼──────────────────┤ │
│  │ 1  │ aaaa-bbbb-cccc-dd │ Juan     │ ...              │ │
│  │ 2  │ aaaa-bbbb-cccc-dd │ Maria    │ ...              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ✅ CORRECT - Uses Better Auth UUID                        │
│                                                              │
│  TABLE: teams                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id │ userId             │ name   │ ...               │ │
│  ├────┼────────────────────┼────────┼──────────────────┤ │
│  │ 1  │ aaaa-bbbb-cccc-dd │ Team A │ ...              │ │
│  │ 2  │ aaaa-bbbb-cccc-dd │ Team B │ ...              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ✅ CORRECT - Uses Better Auth UUID                        │
│                                                              │
│  [All other tables: categories, transactions, games, etc]   │
│  ✅ ALL CORRECT - Use Better Auth UUID                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## DESIRED STATE (AFTER UNIFICATION)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER LOGS IN WITH GOOGLE               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────────┐
              │  Better Auth Handler       │
              │  /api/auth/[...all]/route │
              │                            │
              │  Creates:                  │
              │  - Table `user`            │
              │  - user.id = UUID          │
              └────────────────────────────┘
                           │
                           ▼
                    ✅ ONE SOURCE OF TRUTH
                    user.id = UUID


                         DATABASE

┌─────────────────────────────────────────────────────────────┐
│                    POSTGRES DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TABLE: user (Better Auth)                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id                     │ email              │ name      │ │
│  ├────────────────────────┼────────────────────┼───────────┤ │
│  │ aaaa-bbbb-cccc-dddd   │ user@gmail.com    │ John Doe  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  TABLE: attendees                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id │ userId             │ name     │ ...              │ │
│  ├────┼────────────────────┼──────────┼──────────────────┤ │
│  │ 1  │ aaaa-bbbb-cccc-dd │ Juan     │ ...              │ │
│  │ 2  │ aaaa-bbbb-cccc-dd │ Maria    │ ...              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ✅ References user.id                                     │
│                                                              │
│  TABLE: teams                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ id │ userId             │ name   │ ...               │ │
│  ├────┼────────────────────┼────────┼──────────────────┤ │
│  │ 1  │ aaaa-bbbb-cccc-dd │ Team A │ ...              │ │
│  │ 2  │ aaaa-bbbb-cccc-dd │ Team B │ ...              │ │
│  └────────────────────────────────────────────────────────┘ │
│  ✅ References user.id                                     │
│                                                              │
│  [All other tables]                                          │
│  ✅ ALL reference user.id                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## SUMMARY TABLE

| Aspect | Current | After Fix |
|--------|---------|-----------|
| Number of userId types | 2 (UUID + nanoid) | 1 (UUID) |
| Source of truth | Ambiguous | Clear (Better Auth) |
| Unused tables | app_users | None |
| Data consistency | Good (but confusing) | Perfect |
| Code simplicity | Medium | High |
| Risk of bugs | Low now, High later | Minimal |

---

## KEY INSIGHTS

1. **✅ Data is currently CORRECT**
   - All stored data uses Better Auth UUID
   - No data corruption

2. **⚠️ But CODE is CONFUSING**
   - Two patterns for getting userId
   - Unused app_users table
   - Can lead to maintenance issues

3. **🎯 Solution is SIMPLE**
   - Delete app_users
   - Unify the two patterns
   - Keep everything else the same

4. **📊 Zero Migration Needed**
   - No data migration required
   - Just schema changes

---

*This diagram shows why unification is safe and necessary*
