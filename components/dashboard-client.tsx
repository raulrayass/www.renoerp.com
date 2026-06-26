'use client'

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardData {
  totalIncome: number
  totalExpense: number
  balance: number
  monthlyData: { month: string; income: number; expense: number }[]
  expenseByCategory: { name: string; color: string; total: number }[]
  recentTransactions: {
    id: number
    type: string
    amount: string
    date: string
    description: string
    categoryName: string | null
    categoryColor: string | null
    categoryIcon: string | null
  }[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const { totalIncome, totalExpense, balance, monthlyData, expenseByCategory, recentTransactions } = data

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Resumen general de tus finanzas</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Balance Total</p>
              <p className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Ingresos</p>
              <p className="text-2xl font-bold mt-1 text-[oklch(0.55_0.17_160)]">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.17_160)]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[oklch(0.55_0.17_160)]" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Acumulado total</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Egresos</p>
              <p className="text-2xl font-bold mt-1 text-[oklch(0.55_0.20_25)]">
                {formatCurrency(totalExpense)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.55_0.20_25)]/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-[oklch(0.55_0.20_25)]" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Acumulado total</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-semibold text-foreground mb-4">Ingresos vs Egresos (últimos 6 meses)</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 240)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'oklch(0.52 0.02 240)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'oklch(0.52 0.02 240)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid oklch(0.88 0.01 240)', fontSize: '13px' }}
                />
                <Bar dataKey="income" name="Ingresos" fill="oklch(0.55 0.17 160)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Egresos" fill="oklch(0.55 0.20 25)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
              No hay datos aún. Agrega transacciones para ver la gráfica.
            </div>
          )}
        </Card>

        {/* Pie chart */}
        <Card className="p-5">
          <h2 className="font-semibold text-foreground mb-4">Egresos por categoría</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={48}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-muted-foreground text-sm text-center px-4">
              No hay egresos registrados aún.
            </div>
          )}
        </Card>
      </div>

      {/* Recent transactions */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-4">Transacciones recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay transacciones aún. Ve a la sección de Transacciones para agregar.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${t.categoryColor ?? '#888'}20` }}
                  >
                    {t.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" style={{ color: 'oklch(0.55 0.17 160)' }} />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" style={{ color: 'oklch(0.55 0.20 25)' }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.categoryName ?? 'Sin categoría'} · {t.date}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${t.type === 'income' ? 'text-[oklch(0.55_0.17_160)]' : 'text-[oklch(0.55_0.20_25)]'}`}
                >
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(parseFloat(t.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
