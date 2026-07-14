import { auth } from '@/lib/auth'
import { StaffClient } from '@/components/staff-client'
import { redirect } from 'next/navigation'

export default async function StaffPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  return <StaffClient userId={session.user.id} />
}
