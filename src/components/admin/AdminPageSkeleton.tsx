export function AdminPageSkeleton() {
  return (
    <div className="animate-pulse p-8">
      <div className="mb-8 h-8 w-48 rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-slate-200/80" />
        ))}
      </div>
      <div className="mt-8 h-64 rounded-xl bg-slate-200/60" />
    </div>
  );
}
