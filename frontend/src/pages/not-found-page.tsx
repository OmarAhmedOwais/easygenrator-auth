import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 text-center">
      <div>
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <Button asChild className="mt-6">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
