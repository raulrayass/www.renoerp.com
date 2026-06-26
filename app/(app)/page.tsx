import { getDashboardData } from '@/app/actions/transactions'
import { DashboardClient } from '@/components/dashboard-client'

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
