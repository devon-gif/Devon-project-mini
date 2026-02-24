export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFF]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}
