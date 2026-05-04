export function ComingSoon({ name }: { name: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2 p-8 text-center bg-zinc-900/80">
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-sm opacity-60">Coming in Plan 2.</p>
    </div>
  )
}
