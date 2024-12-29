import GeneralCard from "./vertical-card";
import { CardProps } from "@/app/model/card-props";
import { useMedia } from "@/app/contexts/media-context";
// import { hasCookie } from "cookies-next";

export function SongCard(props: CardProps) {
  const { playSong, pauseSong, currentSong, isPlaying, clearQueue } = useMedia();

  const handlePlayClick = async () => {
    // if (!hasCookie('session')) {
    //   redirectToLogin(window.location.pathname);
    //   return;
    // }

    if (currentSong?.id === props.songID && isPlaying) {
      pauseSong();
      return;
    }

    const song = {
      id: props.songID!,
      duration: props.duration!,
      title: props.title!,
      artists: props.artists ? props.artists.map(artist => ({ 
        artist: {
          id: artist.id || '',
          name: artist.name || ''
        }
      })) : [],
      thumbnailurl: props.img.src
    }
    playSong(song);
    clearQueue();
  };

  return <GeneralCard {...props} isMultipleItemSub={props.artists && props.artists.length > 1
    
  } onClick={handlePlayClick} />;
}