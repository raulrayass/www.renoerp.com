'use client'

import { useSession } from '@/lib/auth-client'
import { PageHeader } from '@/components/page-header'
import { CreateEventForm } from '@/components/create-event-form'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CreateEventPage() {
  const session = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session === undefined) {
      return
    }

    if (!session?.data?.user?.id) {
      router.push('/sign-in')
      return
    }

    setIsLoading(false)
  }, [session, router])

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto">
        <PageHeader title="Crear Evento" description="Cargando..." />
      </main>
    )
  }

  if (!session?.data?.user?.id) {
    return null
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <PageHeader title="Crear Evento" description="Crea un nuevo evento para organizar tus campamentos y actividades" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <CreateEventForm userId={session.data.user.id} />
      </div>
    </main>
  )
}
