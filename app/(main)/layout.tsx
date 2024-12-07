/**
 * RootLayout component for the MusikStreaming app.
 * This component sets up the main layout structure including the navigation bar,
 * navigation rail, content area, and the song playing section.
 */

import { Inter } from "next/font/google";
import "../globals.css";
// import "material-symbols/outlined.css";
import NavBar from "@/app/components/navs/nav-bar";
import NavRail from "@/app/components/navs/nav-rail";
import SongControl from "@/app/components/audio/song-control";
import BottomNavBar from "@/app/components/navs/bottom-nav-bar";
import type { Metadata } from "next";
import { MediaProvider } from "@/app/contexts/media-context";
import QueueContainer from '@/app/components/audio/queue-container';
import { LikedProvider } from "@/app/contexts/liked-context";

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

const compose = (providers: Array<React.ComponentType<{ children: React.ReactNode }>>) => {
  const ComposedComponent = providers.reduce(
    (Prev, Curr) => {
      const ProviderWrapper = ({ children }: { children: React.ReactNode }) => (
        <Prev>
          <Curr>{children}</Curr>
        </Prev>
      );
      ProviderWrapper.displayName = 'ProviderWrapper';
      return ProviderWrapper;
    }
  );
  ComposedComponent.displayName = 'Providers';
  return ComposedComponent;
};

const Providers = compose([MediaProvider, LikedProvider]);

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
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <NavBar />
          <div className="content flex p-4 pr-1 md:gap-4 flex-grow flex-1 justify-stretch">
            <NavRail />
            <div className="center-scroll flex flex-grow self-stretch rounded-xl justify-stretch">
              <div className="center-scroll-inner min-h-[100vh] flex items-start h-full self-stretch w-full bg-[--md-sys-color-surface-container-low] rounded-l-xl px-2 md:px-4 py-6">
                {children}
              </div>
            </div>
            <QueueContainer />
          </div>
          <div className="sticky bottom-0">
            <SongControl />
            <BottomNavBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
