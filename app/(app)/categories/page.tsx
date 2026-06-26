import { getCategories } from '@/app/actions/categories'
import { CategoriesClient } from '@/components/categories-client'

export default async function CategoriesPage() {
  const categories = await getCategories()
  return <CategoriesClient categories={categories} />
}
