'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Filter, X } from 'lucide-react'

export interface FilterConfig {
  id: string
  label: string
  type: 'search' | 'select' | 'number'
  placeholder?: string
  options?: { value: string; label: string }[]
  value: string
}

interface FilterPanelProps {
  filters: FilterConfig[]
  onFilterChange: (filterId: string, value: string) => void
  onClearAll: () => void
  showMobile?: boolean
}

export function FilterPanel({
  filters,
  onFilterChange,
  onClearAll,
  showMobile = false,
}: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false)
  const activeFilterCount = filters.filter((f) => f.value && f.value !== 'all').length

  const filterContent = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {filters.map((filter) => (
        <div key={filter.id}>
          <Label className="text-xs font-semibold mb-1.5 block">{filter.label}</Label>
          {filter.type === 'search' && (
            <Input
              type="text"
              value={filter.value}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              placeholder={filter.placeholder || 'Buscar...'}
              className="h-9"
            />
          )}
          {filter.type === 'number' && (
            <Input
              type="number"
              value={filter.value}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              placeholder={filter.placeholder || '$0'}
              className="h-9"
            />
          )}
          {filter.type === 'select' && filter.options && (
            <Select value={filter.value} onValueChange={(v) => onFilterChange(filter.id, v)}>
              <SelectTrigger className="h-9">
                {filter.value && filter.value !== 'all' ? (
                  <span>{filter.options.find((o) => o.value === filter.value)?.label}</span>
                ) : (
                  <SelectValue placeholder={filter.placeholder || 'Selecciona...'} />
                )}
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      ))}
    </div>
  )

  // Desktop inline display
  if (!showMobile) {
    return showFilters && (
      <Card className="p-4 border-primary/20 bg-muted/50 space-y-3">
        {filterContent}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearAll}
            className="flex-1 gap-2"
          >
            <X className="w-3 h-3" />
            Limpiar todos
          </Button>
        </div>
      </Card>
    )
  }

  // Mobile drawer display
  return (
    <>
      <Button
        variant={activeFilterCount > 0 ? 'default' : 'outline'}
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="gap-2 w-full sm:w-auto"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filtros</span>
        {activeFilterCount > 0 && (
          <span className="text-xs bg-primary/20 px-1.5 rounded">({activeFilterCount})</span>
        )}
      </Button>

      {showFilters && (
        <div className="fixed lg:hidden inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
          <div
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-lg shadow-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">Filtros avanzados</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {filters.map((filter) => (
                <div key={filter.id}>
                  <Label className="text-xs font-semibold mb-2 block">{filter.label}</Label>
                  {filter.type === 'search' && (
                    <Input
                      type="text"
                      value={filter.value}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      placeholder={filter.placeholder || 'Buscar...'}
                      className="h-9"
                    />
                  )}
                  {filter.type === 'number' && (
                    <Input
                      type="number"
                      value={filter.value}
                      onChange={(e) => onFilterChange(filter.id, e.target.value)}
                      placeholder={filter.placeholder || '$0'}
                      className="h-9"
                    />
                  )}
                  {filter.type === 'select' && filter.options && (
                    <Select
                      value={filter.value}
                      onValueChange={(v) => onFilterChange(filter.id, v)}
                    >
                      <SelectTrigger className="h-9">
                        {filter.value && filter.value !== 'all' ? (
                          <span>{filter.options.find((o) => o.value === filter.value)?.label}</span>
                        ) : (
                          <SelectValue placeholder={filter.placeholder || 'Selecciona...'} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {filter.options.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onClearAll()
                  }}
                  className="flex-1 gap-2"
                >
                  <X className="w-3 h-3" />
                  Limpiar todos
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
