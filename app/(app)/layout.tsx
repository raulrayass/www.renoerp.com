import { Topbar } from '@/components/topbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <Topbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
