import { auth } from '@/lib/auth'
import { getAllChurches } from '@/app/actions/churches'
import { StaffClient } from '@/components/staff-client'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StaffPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const churches = await getAllChurches(session.user.id)

  return <StaffClient userId={session.user.id} churches={churches} />
}
