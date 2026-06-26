import { getTransactions } from '@/app/actions/transactions'
import { getCategories } from '@/app/actions/categories'
import { TransactionsClient } from '@/components/transactions-client'

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getCategories(),
  ])
  return <TransactionsClient transactions={transactions} categories={categories} />
}
