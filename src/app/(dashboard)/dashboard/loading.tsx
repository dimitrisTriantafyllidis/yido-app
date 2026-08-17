export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 w-48 bg-[var(--color-muted)] rounded-[var(--radius-sm)]" />
          <div className="h-4 w-64 bg-[var(--color-muted)] rounded-[var(--radius-sm)] mt-2" />
        </div>
        <div className="h-12 w-36 bg-[var(--color-muted)] rounded-[var(--radius-md)]" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 h-52"
          >
            <div className="h-5 w-20 bg-[var(--color-muted)] rounded-full mb-4" />
            <div className="h-5 w-40 bg-[var(--color-muted)] rounded-[var(--radius-sm)] mb-2" />
            <div className="h-4 w-32 bg-[var(--color-muted)] rounded-[var(--radius-sm)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
