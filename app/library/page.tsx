'use client';

import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import PlaylistsGrid from "../components/api-fetch-container/playlists-grid";
import TabButton from "@/app/components/buttons/tab-button";

export default function Library() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("playlists");

    useEffect(() => {
        const session = getCookie("session");
        if (!session) {
            router.replace("/login");
        }
    }, [router]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Your Library</h1>
            
            <div className="tabs flex justify-around mb-5 relative w-fit">
                <TabButton 
                    className="rounded-t-sm"
                    label="Playlists"
                    isActive={activeTab === 'playlists'}
                    onClick={() => setActiveTab('playlists')}
                    hasIcon={true}
                    icon="queue_music"
                />
                <TabButton 
                    className="rounded-t-sm"
                    label="Favorites"
                    isActive={activeTab === 'favorites'}
                    onClick={() => setActiveTab('favorites')}
                    hasIcon={true}
                    icon="favorite"
                />
                <div
                    className={`absolute bottom-0 h-0.5 bg-[--md-sys-color-primary] transition-all duration-300 ease-in-out w-1/2
                        ${activeTab === 'playlists' ? 'left-0' : 'left-1/2'}`}
                />
            </div>

            <div className="tab-content w-full">
                {activeTab === 'playlists' && <PlaylistsGrid />}
                {activeTab === 'favorites' && (
                    <div className="text-center text-gray-500">
                        <span className="material-symbols-outlined text-4xl mb-2">favorite</span>
                        <p>Your favorite tracks will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}