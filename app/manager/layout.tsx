'use client';

import NavBar from '@/app/components/navs/nav-bar';
import NavRail from '@/app/components/navs/nav-rail';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import './global.css';

const managerItems = {
    'dashboard': {
        text: 'Bảng điều khiển',
        icon: 'dashboard',
        badgevalue: 0,
        href: '/manager',
        type: 0
    },
    'album': {
        text: 'Discography',
        icon: 'album',
        badgevalue: 0,
        href: '/manager/discography',
        type: 0
    },
    'settings': {
        text: 'Cài đặt',
        icon: 'settings',
        badgevalue: 0,
        href: '/manager/settings',
        type: 0
    }
} as const;

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifyAccess = async () => {
            try {
                const response = await fetch('/api/auth/user-info', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    router.replace('/');
                    return;
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Failed to verify manager access:', error);
                router.replace('/');
            }
        };

        verifyAccess();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[--md-sys-color-primary]"></div>
            </div>
        );
    }

    return (
        <html lang="en">
            <body>
                <div className="flex flex-col min-h-screen bg-[--md-sys-color-background]">
                    <NavBar />
                    <div className="flex flex-1 gap-4 p-4 overflow-hidden">
                        <NavRail 
                            className="hidden md:flex h-full" 
                            items={managerItems}
                        />
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
} 