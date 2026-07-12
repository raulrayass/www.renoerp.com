'use client'

import { useEffect, useState } from 'react'
import { getDashboardData } from '@/app/actions/transactions'
import { getChurchDistribution, getShirtSizeDistribution } from '@/app/actions/attendees'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { StatCard } from '@/components/stat-card'

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

const INCOME_COLOR = '#22c55e'
const EXPENSE_COLOR = '#f97316'

export function DashboardClient({ userId }: { userId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [churchData, setChurchData] = useState<any[]>([])
  const [sizeData, setSizeData] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size (only on client)
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    getDashboardData(userId).then(setData)
    getChurchDistribution(userId).then(setChurchData)
    getShirtSizeDistribution(userId).then(setSizeData)
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
    categoryComparison, recentTransactions,
  } = data

  const hasAnyData = totalIncome > 0 || totalExpense > 0

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-5 flex flex-col gap-4 max-w-7xl mx-auto">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <StatCard
          label="Balance Total"
          value={formatCurrency(balance)}
          icon={Wallet}
          color={balance >= 0 ? 'primary' : 'red'}
          subtitle={balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
        />
        <StatCard
          label="Total Ingresos"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          color="green"
          subtitle="Acumulado total"
        />
        <StatCard
          label="Total Egresos"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          color="orange"
          subtitle="Acumulado total"
        />
      </div>

      {/* Monthly chart + Expense pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">Ingresos vs Egresos por mes</h2>
          {monthlyData.some(m => m.income > 0 || m.expense > 0) ? (
            <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
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

        <Card>
          <h2 className="font-semibold text-foreground mb-1">Egresos por categoria</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 250 : 260}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={isMobile ? 60 : 80}
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
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-1">Ingreso y Egreso por categoria</h2>
        <p className="text-xs text-muted-foreground mb-4">Comparativo de cada categoria del campamento</p>
        {hasAnyData && categoryComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(isMobile ? 200 : 220, categoryComparison.length * 40)}>
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

      {/* Income pie + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card>
          <h2 className="font-semibold text-foreground mb-1">Ingresos por categoria</h2>
          {incomeByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 250 : 260}>
              <PieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={isMobile ? 60 : 80}
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

        <Card>
          <h2 className="font-semibold text-foreground mb-1">Camperos por Iglesia</h2>
          <p className="text-xs text-muted-foreground mb-4">Distribución de camperos del campamento</p>
          {churchData && churchData.length > 0 ? (
            <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 250 : 260}>
              <PieChart>
                <Pie
                  data={churchData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={isMobile ? 60 : 80}
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

      {/* Shirt sizes distribution */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-1">Distribución de Tallas</h2>
        <p className="text-xs text-muted-foreground mb-4">Cantidad de camperos por talla de camiseta</p>
        {sizeData && sizeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 280}>
            <PieChart>
              <Pie
                data={sizeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {sizeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value} camperos`}
                contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid var(--border)' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay datos de tallas. Verifica que los camperos tengan talla asignada.
          </div>
        )}
      </Card>

      {/* Recent transactions */}
      <Card className="p-5">
        <h2 className="font-semibold text-foreground mb-4">Movimientos recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No hay transacciones aun. Ve a Transacciones para agregar.
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
