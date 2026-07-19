'use client'

import { useEffect, useState } from 'react'
import { getDashboardData } from '@/app/actions/transactions'
import { getChurchDistribution } from '@/app/actions/attendees'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Banknote, Smartphone } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'
import { PageHeader } from '@/components/page-header'

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#f97316'

export function DashboardClient({ userId }: { userId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [churchData, setChurchData] = useState<any[]>([])

  useEffect(() => {
    getDashboardData(userId).then(setData)
    getChurchDistribution(userId).then(setChurchData)
  }, [userId])

  if (!data) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const {
    totalIncome, totalExpense, balance,
    monthlyData, expenseByCategory, incomeByCategory,
    categoryComparison, recentTransactions, paymentMethodBreakdown, mobileBanking,
  } = data

  const hasAnyData = totalIncome > 0 || totalExpense > 0

  // Desglose por método de pago para las barras (estilo mockup)
  const cashAvailable = paymentMethodBreakdown?.cash?.available ?? 0
  const transferAvailable = paymentMethodBreakdown?.transfer?.available ?? 0
  const depositAvailable = paymentMethodBreakdown?.deposit?.available ?? 0
  const totalAvailable = cashAvailable + transferAvailable + depositAvailable
  const pct = (v: number) => (totalAvailable > 0 ? Math.round((v / totalAvailable) * 100) : 0)

  const methodBars = [
    { label: 'Efectivo', value: cashAvailable, color: INCOME_COLOR, icon: Banknote },
    { label: 'Transferencia', value: transferAvailable, color: '#3b82f6', icon: Smartphone },
    { label: 'Depósito', value: depositAvailable, color: '#9333ea', icon: Smartphone },
  ]

  return (
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 flex flex-col gap-3 max-w-7xl mx-auto w-full">
      {/* Header */}
      <PageHeader title="Inicio" description="Resumen del campamento" />

      {/* ===== 1. Balance Total (héroe) ===== */}
      <div className="glow-primary">
        <Card className="p-4 hero-card">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Balance Total</p>
              <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(balance)}</p>
            </div>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Efectivo:</span>
              <span className="font-medium">{formatCurrency(cashAvailable)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banca Móvil:</span>
              <span className="font-medium">{formatCurrency(transferAvailable + depositAvailable)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== 2. Ingresos + Egresos ===== */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          label="Total Ingresos"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          color="green"
          subtitle="Acumulado total"
          className="glass-card"
        />
        <StatCard
          label="Total Egresos"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          color="orange"
          subtitle="Acumulado total"
          className="glass-card"
        />
      </div>

      {/* ===== 3. Disponible por método de pago (barras estilo mockup) ===== */}
      {totalAvailable > 0 && (
        <Card className="p-5 gradient-card">
          <h2 className="font-semibold text-foreground mb-4">Disponible por método</h2>
          <div className="space-y-3">
            {methodBars.map((m) => {
              const Icon = m.icon
              return (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: m.color + '1a' }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground tabular-nums">
                        {formatCurrency(m.value)}
                      </span>
                      <span className="text-xs text-muted-foreground w-9 text-right tabular-nums">
                        {pct(m.value)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct(m.value)}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ===== 4. Movimientos recientes ===== */}
      <Card className="p-5 gradient-card">
        <h2 className="font-semibold text-foreground mb-4">Movimientos recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay transacciones aun. Ve a Finanzas para agregar.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: (t.categoryColor ?? '#888') + '22' }}
                  >
                    {t.type === 'income'
                      ? <ArrowUpRight className="w-4 h-4" style={{ color: INCOME_COLOR }} />
                      : <ArrowDownRight className="w-4 h-4" style={{ color: EXPENSE_COLOR }} />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.categoryName ?? 'Sin categoria'} &middot; {t.date}
                    </p>
                  </div>
                </div>
                <span
                  className="text-sm font-semibold shrink-0"
                  style={{ color: t.type === 'income' ? INCOME_COLOR : EXPENSE_COLOR }}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount as string))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ===== 5. Gráficas ===== */}

      {/* Monthly chart + Expense pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 gradient-card">
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">Ingresos vs Egresos por mes</h2>
          {monthlyData.some(m => m.income > 0 || m.expense > 0) ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="income" name="Ingresos" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Egresos" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="No hay datos aun. Agrega transacciones para ver la grafica." />
          )}
        </Card>

        <Card className="gradient-card">
          <h2 className="font-semibold text-foreground mb-1">Egresos por categoria</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="42%"
                  outerRadius={80}
                  innerRadius={48}
                >
                  {expenseByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="No hay egresos registrados aun." />
          )}
        </Card>
      </div>

      {/* Per-category comparison */}
      <Card className="p-5 gradient-card">
        <h2 className="font-semibold text-foreground mb-1">Ingreso y Egreso por categoria</h2>
        <p className="text-xs text-muted-foreground mb-4">Comparativo de cada categoria del campamento</p>
        {hasAnyData && categoryComparison.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(220, categoryComparison.length * 52)}>
            <BarChart
              data={categoryComparison}
              layout="vertical"
              margin={{ left: 16, right: 16 }}
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" name="Ingresos" fill={INCOME_COLOR} radius={[0, 4, 4, 0]} barSize={14} />
              <Bar dataKey="expense" name="Egresos" fill={EXPENSE_COLOR} radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="Agrega transacciones para ver el comparativo por categoria." />
        )}
      </Card>

      {/* Income pie + Church pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="gradient-card">
          <h2 className="font-semibold text-foreground mb-1">Ingresos por categoria</h2>
          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="42%"
                  outerRadius={80}
                  innerRadius={48}
                >
                  {incomeByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart text="No hay ingresos registrados aun." />
          )}
        </Card>

        <Card className="gradient-card">
          <h2 className="font-semibold text-foreground mb-1">Camperos por Iglesia</h2>
          <p className="text-xs text-muted-foreground mb-4"></p>
          {churchData && churchData.length > 0 ? (
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={churchData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="42%"
                  outerRadius={80}
                  innerRadius={48}
                >
                  {churchData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value} camperos`}
                  contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No hay datos de iglesias. Verifica que los camperos tengan iglesia asignada.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-56 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
      {text}
    </div>
  )
}
