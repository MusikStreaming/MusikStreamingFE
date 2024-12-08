'use client'

import { AlbumDetails } from '@/app/model/album-details';

export function calculateAlbumDuration(songs: AlbumDetails["songs"]) {
  if (!songs) return 0;
  const totalDuration = songs.reduce((total, song) => total + (song.song?.duration || 0), 0);
  return totalDuration;
}

export function countAlbumSongs(songs: AlbumDetails["songs"]) {
  if (!songs) return 0;
  return songs.length;
}

export function formatSongCount(count: number) {
  return count > 1 ? `${count} songs` : `${count} song`;
} 