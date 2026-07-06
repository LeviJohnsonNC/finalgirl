import { Loader2 } from 'lucide-react';

/** Shared Suspense fallback in the app's VHS loading voice. */
export const PageLoading = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-muted-foreground">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <p className="font-vhs text-xs tracking-widest animate-pulse">[ PROJECTOR WARMING UP... ]</p>
  </div>
);
