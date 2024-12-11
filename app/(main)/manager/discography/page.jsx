'use client';

import "@material/web/fab/fab";
import { useRouter } from "next/navigation";

export default function DiscographyPage() {
  const router = useRouter();
  return <div>
    <h1 className="text-2xl font-bold">Discography</h1>
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Albums</h2>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Songs</h2>
      </div>
    </div>
    <div className="fixed bottom-6 right-6">
      <div className="relative group">
        <button className="md-fab bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] hover:bg-[--md-sys-color-primary-container] hover:text-[--md-sys-color-on-primary-container] active:bg-[--md-sys-color-primary-container] active:text-[--md-sys-color-on-primary-container] shadow-md p-2 rounded-full flex items-center justify-center gap-2 w-12 h-12 min-w-[48px] min-h-[48px]" aria-label="Toggle add menu">
          <md-ripple />
          <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
        </button>

        <div className="absolute bottom-full right-0 mb-2 flex flex-col gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <button
            onClick={() => router.push('/manager/discography/add?type=album')}
            className="md-fab bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] hover:bg-[--md-sys-color-primary-container] hover:text-[--md-sys-color-on-primary-container] shadow-md p-2 rounded-full flex items-center justify-center gap-2 relative group/button w-12 h-12 min-w-[48px] min-h-[48px]"
            aria-label="Add new album"
          >
            <md-ripple />
            <span className="material-symbols-outlined">album</span>
            <span className="absolute right-full mr-2 bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface] px-2 py-1 rounded whitespace-nowrap opacity-0 invisible group-hover/button:opacity-100 group-hover/button:visible transition-all">
              Add new album
            </span>
          </button>

          <button
            onClick={() => router.push('/manager/discography/add?type=song')}
            className="md-fab bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] hover:bg-[--md-sys-color-primary-container] hover:text-[--md-sys-color-on-primary-container] shadow-md p-2 rounded-full flex items-center justify-center gap-2 relative group/button w-12 h-12 min-w-[48px] min-h-[48px]"
            aria-label="Add new song"
          >
            <md-ripple />
            <span className="material-symbols-outlined">music_note</span>
            <span className="absolute right-full mr-2 bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface] px-2 py-1 rounded whitespace-nowrap opacity-0 invisible group-hover/button:opacity-100 group-hover/button:visible transition-all">
              Add new song
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>;
}
