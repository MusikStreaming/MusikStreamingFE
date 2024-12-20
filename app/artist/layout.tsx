import { ReactNode } from 'react';
import { Suspense } from 'react';
import Skeleton from '@/app/components/loading/skeleton';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-4">
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-1/2 h-6" />
        <Skeleton className="w-1/2 h-6" />
      </div>
    }>
    {children}
    </Suspense>
  );
}