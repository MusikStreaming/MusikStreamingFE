import { ReactNode } from 'react';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}