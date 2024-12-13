import GeneralCard from "./vertical-card";
import { CardProps } from "@/app/model/card-props";
import { useMedia } from "@/app/contexts/media-context";
// import { hasCookie } from "cookies-next";

export function SongCard(props: CardProps) {
  const { playSong, pauseSong, currentSong, isPlaying } = useMedia();

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
      artists: props.artists!.map(artist => ({ artist })),
      // albums: props.album!,
      thumbnailurl: props.img.src
    }
    playSong(song);
  };

  return <GeneralCard {...props} onClick={handlePlayClick} />;
}