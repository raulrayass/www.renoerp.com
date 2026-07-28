import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth-client'
import { PageHeader } from '@/components/page-header'
import { CreateEventForm } from '@/components/create-event-form'

export const metadata = {
  title: 'Crear Evento | FinanzApp',
  description: 'Crear un nuevo evento para tu campamento',
}

export default async function CreateEventPage() {
  const session = await getCurrentUser()

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <PageHeader title="Crear Evento" description="Crea un nuevo evento para organizar tus campamentos y actividades" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <CreateEventForm userId={session.user.id} />
      </div>
    </main>
  )
}
