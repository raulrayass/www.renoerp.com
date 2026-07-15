'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Category } from '@/lib/db/schema'

export interface TransactionSmartFilterProps {
  search: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeChange: (value: string) => void
  categoryFilter: string
  onCategoryChange: (value: string) => void
  categories: Category[]
  methodFilter: string
  onMethodChange: (value: string) => void
  dateFrom: string
  onDateFromChange: (value: string) => void
  dateTo: string
  onDateToChange: (value: string) => void
  onClearFilters: () => void
}

const paymentMethods = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'check', label: 'Cheque' },
]

export function TransactionSmartFilter({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  categories,
  methodFilter,
  onMethodChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
}: TransactionSmartFilterProps) {
  const hasActiveFilters = typeFilter !== 'all' || categoryFilter !== 'all' || methodFilter !== 'all' || dateFrom || dateTo || search

  return (
    <div className="space-y-1 bg-card border-2 border-border rounded-lg p-2 sm:p-3">
      {/* Header with search and clear button */}
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar..."
            className="pl-7 sm:pl-10 h-6 sm:h-8 text-xs border-2 border-border rounded-md"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 sm:h-8 text-xs px-1.5 shrink-0"
          >
            Limpiar
          </Button>
        )}
      </div>

      {/* Filters Row 1: Type, Category, Method - apilados en móvil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-1">
        {/* Type filter */}
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="text-xs h-6 sm:h-8 py-0 px-1.5 sm:px-2 border-2 border-border rounded-md">
            <span className="text-foreground text-xs truncate">
              {typeFilter === 'all' ? 'Tipo' : typeFilter === 'income' ? 'Ingresos' : 'Egresos'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Ingresos</SelectItem>
            <SelectItem value="expense">Egresos</SelectItem>
          </SelectContent>
        </Select>

        {/* Category filter */}
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger className="text-xs h-6 sm:h-8 py-0 px-1.5 sm:px-2 border-2 border-border rounded-md">
            <span className="text-foreground text-xs truncate">
              {categoryFilter === 'all' ? 'Categoría' : categories.find(c => String(c.id) === categoryFilter)?.name || 'Categoría'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Method filter */}
        <Select value={methodFilter} onValueChange={onMethodChange}>
          <SelectTrigger className="text-xs h-6 sm:h-8 py-0 px-1.5 sm:px-2 border-2 border-border rounded-md">
            <span className="text-foreground text-xs truncate">
              {methodFilter === 'all' ? 'Método' : paymentMethods.find(m => m.value === methodFilter)?.label || 'Método'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters Row 2: Date range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 sm:gap-1">
        <div className="relative">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-6 sm:h-8 text-xs border-2 border-border rounded-md px-2"
          />
          {!dateFrom && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              Desde
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-6 sm:h-8 text-xs border-2 border-border rounded-md px-2"
          />
          {!dateTo && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              Hasta
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
