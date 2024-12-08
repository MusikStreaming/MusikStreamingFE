import BrowseCard from "@/app/components/browse/browse-card";

export default function BrowseContainer() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <BrowseCard
                    title="Pop"
                    image={{
                        src: "/images/genres/pop.jpg",
                        alt: "Pop",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-pink-500"
                    textColour="text-on-pink-500"
                    url="/"
                />
                <BrowseCard
                    title="Rock"
                    image={{
                        src: "/images/genres/rock.jpg",
                        alt: "Rock",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-purple-500"
                    textColour="text-on-    purple-500"
                    url="/"
                />
                <BrowseCard
                    title="Hip Hop"
                    image={{
                        src: "/images/genres/hiphop.jpg",
                        alt: "Hip Hop",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-blue-500"
                    textColour="text-on-blue-500"
                    url="/"
                />
                <BrowseCard
                    title="Electronic"
                    image={{
                        src: "/images/genres/electronic.jpg",
                        alt: "Electronic",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-green-500"
                    textColour="text-on-green-500"
                    url="/"
                />
                <BrowseCard
                    title="Jazz"
                    image={{
                        src: "/images/genres/jazz.jpg",
                        alt: "Jazz",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-yellow-500"
                    textColour="text-on-yellow-500"
                    url="/"
                />
                <BrowseCard
                    title="Classical"
                    image={{
                        src: "/images/genres/classical.jpg",
                        alt: "Classical",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-red-500"
                    textColour="text-on-red-500"
                    url="/"
                />
                <BrowseCard
                    title="R&B"
                    image={{
                        src: "/images/genres/rnb.jpg",
                        alt: "R&B",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-indigo-500"
                    textColour="text-on-indigo-500"
                    url="/"
                />
                <BrowseCard
                    title="Country"
                    image={{
                        src: "/images/genres/country.jpg",
                        alt: "Country",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-orange-500"
                    textColour="text-on-orange-500"
                    url="/"
                />
                <BrowseCard
                    title="Metal"
                    image={{
                        src: "/images/genres/metal.jpg",
                        alt: "Metal",
                        width: 100,
                        height: 100
                    }}
                    bgColour="bg-red-600"
                    textColour="text-on-red-600"
                    url="/"
                />
            </div>
  )
}