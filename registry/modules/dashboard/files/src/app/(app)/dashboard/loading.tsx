/** Instant skeleton while dashboard data loads. */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-2">
        <div className="bg-muted h-7 w-64 animate-pulse rounded-md motion-reduce:animate-none" />
        <div className="bg-muted h-4 w-80 animate-pulse rounded-md motion-reduce:animate-none" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="bg-muted h-36 animate-pulse rounded-xl motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
