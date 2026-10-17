interface SyncNoticeProps { count: number; onRetry: () => Promise<boolean> }

export function SyncNotice({ count, onRetry }: SyncNoticeProps) {
  if (!count) return null;
  return (
    <div role="status" className="mb-4 border border-primary/30 bg-card px-4 py-3 type-caption text-foreground">
      {count} {count === 1 ? 'change is' : 'changes are'} saved on this device and waiting for the cloud archive.
      <button className="ml-3 underline text-primary min-h-[44px]" onClick={() => { void onRetry(); }}>
        RETRY SAVE
      </button>
    </div>
  );
}
