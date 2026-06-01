export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-8 py-8">
      <div className="container-narrow space-y-3 text-center">
        <div className="mx-auto h-9 w-48 rounded-lg bg-slate-200" />
        <div className="mx-auto h-5 w-72 max-w-full rounded bg-slate-100" />
      </div>
      <div className="container-narrow grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
