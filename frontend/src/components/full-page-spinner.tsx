import { Loader2 } from 'lucide-react';

export function FullPageSpinner() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Loading">
      <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
    </div>
  );
}
