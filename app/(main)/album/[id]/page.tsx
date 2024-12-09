import AlbumContent from "./content";

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  return (
    <div className="container mx-auto px-4 py-8">
      <AlbumContent id={id} />
    </div>
  )
}
