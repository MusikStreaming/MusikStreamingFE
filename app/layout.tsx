
/**
 * RootLayout component for the MusikStreaming app.
 * This component sets up the main layout structure including the navigation bar,
 * navigation rail, content area, and the song playing section.
 */

import { Inter } from "next/font/google";
import "./globals.css";
// import "material-symbols/outlined.css";
import NavBar from "@/app/components/navs/nav-bar";
import NavRail from "@/app/components/navs/nav-rail";
import SongControl from "@/app/components/audio/song-control";
import BottomNavBar from "@/app/components/navs/bottom-nav-bar";
import type { Metadata } from "next";
import { MediaProvider } from "@/app/contexts/media-context";

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  style: ['normal', 'italic'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: "MusikStreaming | Home",
  keywords: "music, streaming, material design, songs, artists",
  description: "New music streaming app, using Material Design",
  openGraph: {
    title: "MusikStreaming | Home",
    description: "New music streaming app, using Material Design",
    type: "website"
  }
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * RootLayout component.
 * @param {RootLayoutProps} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <head>  
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />  
      </head>
      <body className={`${inter} antialiased`}>
        <MediaProvider>
          <NavBar />
          <div className="content flex p-4 pr-1 gap-4 flex-grow flex-1 justify-stretch">
            <NavRail />
            <div className="center-scroll flex flex-grow self-stretch rounded-xl justify-stretch">
              <div className="center-scroll-inner min-h-[100vh] flex items-start h-full self-stretch w-full bg-[--md-sys-color-surface-container-low] rounded-l-xl px-4 py-6">
                {children}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0">
            <SongControl />
            <BottomNavBar />
          </div>
        </MediaProvider>
      </body>
    </html>
  );
}
