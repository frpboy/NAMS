export default function ProtectedLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>

      <div className="h-[400px] animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
