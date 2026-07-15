'use client'

import { useUser } from '@/components/user-provider'
import { StaffClient } from '@/components/staff-client'

export default function StaffPage() {
  const { user } = useUser()

  if (!user) {
    return <div className="text-center py-12 text-muted-foreground">Cargando...</div>
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container py-4 sm:py-6">
        <StaffClient userId={user.id} />
      </div>
    </main>
  )
}
