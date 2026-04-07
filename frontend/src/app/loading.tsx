export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"
          aria-hidden
        />
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading Foliage...</p>
      </div>
    </div>
  );
}
