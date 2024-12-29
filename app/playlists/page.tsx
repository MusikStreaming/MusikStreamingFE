'use client'
import { Suspense } from "react"
import PlaylistsGrid from "@/app/components/api-fetch-container/playlists-grid"

export default function PlaylistsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Playlists</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <PlaylistsGrid />
      </Suspense>
    </div>
  );
}
