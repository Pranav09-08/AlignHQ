import { Button } from '@/components/ui/button'

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="rounded-full border border-slate-300 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          AlignHQ Frontend
        </p>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          shadcn is configured and active
        </h1>
        <p className="max-w-xl text-sm text-slate-600 sm:text-base">
          This page is rendering a shadcn Button component and the project is now set up for
          shadcn UI based development.
        </p>
        <Button size="lg">Build Goal Portal UI</Button>
      </section>
    </main>
  )
}

export default App
