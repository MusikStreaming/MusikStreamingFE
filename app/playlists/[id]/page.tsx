import PlaylistContent from "../../components/shared-page-content/content";
import { Suspense } from "react";

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  return (
    <Suspense>
      <div className="container mx-auto px-4 py-8">
        <PlaylistContent id={id} />
      </div>
    </Suspense>
  )
}
