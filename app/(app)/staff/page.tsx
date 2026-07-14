import { auth } from '@/lib/auth'
import { getAllChurches } from '@/app/actions/churches'
import { StaffClient } from '@/components/staff-client'
import { redirect } from 'next/navigation'

export default async function StaffPage() {
  const session = await auth.api.getSession({ headers: await import('next/headers').then(m => m.headers()) })

  if (!session || !session.user) {
    redirect('/login')
  }

  const churches = await getAllChurches(session.user.id)

  return <StaffClient userId={session.user.id} churches={churches} />
}
