import { ReactNode, Suspense } from 'react';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto relative pb-16">
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}