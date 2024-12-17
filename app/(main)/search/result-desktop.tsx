'use client'
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import search from "@/app/api-fetch/search";
import ErrorComponent from "@/app/components/api-fetch-container/fetch-error";

interface ResultDesktopProps {
  query: string;
}

export default function ResultDesktop({ query }: ResultDesktopProps) {
  // const debouncedSearch = useMemo(
  //   () => debounce(async (q: string) => await search(q), 500),
  //   []
  // );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => await search(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 5, // Cache results for 5 minutes
  });

  if (query.length === 0) {
    return <p>Please enter a search term</p>;
  }

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <ErrorComponent onReloadClick={refetch} />;
  if (!data) return <p>No results found</p>;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Search results for &quot;{query}&quot;</h2>
      <div className="flex flex-row gap-4">
        {/* <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
            <h3 className="text-xl font-bold">{section.title}</h3>
            {section.items.map(item => section.render(item))}
          </div> */}
        {
          data && data.data.albums && data.data.albums.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Albums</h3>
              <div className="grid grid-cols-2 gap-4">
                {data.data.albums !== undefined && data.data.albums.map(album => (
                  <div key={album.id} className="flex flex-col gap-2">
                    <Image
                      src={album.thumbnailurl}
                      alt={album.title}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    <p className="text-sm font-bold">{album.title}</p>
                    <p className="text-sm">{album.profiles.map(profile => profile.name).join(", ")}</p>
                  </div>
                ))}
              </div>
            </div>
          ) || null
        }
        {
          data && data.data.songs && data.data.songs.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Songs</h3>
              <div className="flex flex-col gap-4">
                {data.data.songs && data.data.songs.map(song => (
                  <div key={song.id} className="flex gap-2">
                    <Image
                      src={song.thumbnailurl}
                      alt={song.title}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold">{song.title}</p>
                      <p className="text-sm">{song.artists && song.artists.map(artist => artist.artist.name).join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) || null
        }
        {
          data && data.data.artists && data.data.artists.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Artists</h3>
              <div className="flex flex-col gap-4">
                {data.data.artists.map(artist => (
                  <div key={artist.id} className="flex gap-2 items-center">
                    {artist.avatarurl && artist.name && (
                      <Image
                        src={artist.avatarurl}
                        alt={artist.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    )}
                    <p className="text-sm font-bold">{artist.name}</p>
                  </div>
                ))}
              </div>
            </div>
          ) || null
        }
        {
          data && data.data.users && data.data.users.length > 0 && (
            <div className="flex flex-col rounded-lg bg-[--md-sys-color-surface-container-highest] p-4 gap-4">
              <h3 className="text-xl font-bold">Users</h3>
              <div className="flex flex-col gap-4">
                {data.data.users.map(user => (
                  <div key={user.id} className="flex gap-2 items-center">
                    {user.avatarurl && (
                      <div className="flex items-center gap-2 w-16 h-16 overflow-hidden rounded-lg bg-[--md-sys-color-surface-container-lowest]">
                        <Image
                          src={user.avatarurl}
                          alt={user.username}
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-sm font-bold">{user.username}</p>
                  </div>
                ))}
              </div>
            </div>
          ) || null
        }
      </div>
    </div>
  );
}