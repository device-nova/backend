export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="h-9 w-9 rounded-lg skeleton mb-4" />
      <div className="h-8 w-24 rounded-lg skeleton mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 rounded skeleton mb-2 ${i % 2 === 0 ? 'w-full' : 'w-2/3'}`} />
      ))}
    </div>
  );
}
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="h-3 w-20 rounded skeleton" />
      <div className="h-3 w-16 rounded skeleton" />
      <div className="h-3 w-24 rounded skeleton" />
      <div className="h-3 w-12 rounded skeleton" />
      <div className="h-3 flex-1 rounded skeleton" />
    </div>
  );
}
export function SkeletonChart({ height = 220 }) {
  return <div className="w-full rounded-2xl skeleton" style={{ height }} />;
}
export default SkeletonCard;
