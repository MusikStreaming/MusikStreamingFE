'use client'
import { Suspense } from "react";
import { useSearchParams } from 'next/navigation';

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}

function CallbackContent() {
  const searchParams = useSearchParams();
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2>Completing sign in...</h2>
        <p>Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
