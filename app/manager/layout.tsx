'use client';

import NavBar from '@/app/components/navs/nav-bar';
import NavRail from '@/app/components/navs/nav-rail';
import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import './global.css';

const managerItems = {
    'dashboard': {
        text: 'Dashboard',
        badgevalue: 0,
        href: '/manager',
        type: 0
    },
    'album': {
        text: 'Discography',
        badgevalue: 0,
        href: '/manager/discography',
        type: 0
    },
    'settings': {
        text: 'Settings',
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
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const role = getCookie('role');
        console.log('Role:', role);
        
        if (role === 'Artist Manager' || role === 'Artist%20Manager') {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthorized === false) {
            router.replace('/');
        }
    }, [isAuthorized, router]);

    if (isAuthorized === null) {
        return null;
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <html>
            <head>
            <title>Manager Dashboard</title>
            <meta name="description" content="Artist Manager Dashboard for managing discography and settings." />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta property="og:title" content="Manager Dashboard" />
            <meta property="og:description" content="Artist Manager Dashboard for managing discography and settings." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://www.yourwebsite.com/manager" />
            <meta property="og:image" content="https://www.yourwebsite.com/assets/manager-dashboard.png" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Manager Dashboard" />
            <meta name="twitter:description" content="Artist Manager Dashboard for managing discography and settings." />
            <meta name="twitter:image" content="https://www.yourwebsite.com/assets/manager-dashboard.png" />
            </head>
            <body>
                <div className="flex flex-col h-screen">
                    <NavBar />
                    <div className="flex flex-1 gap-4 p-4 overflow-hidden">
                        <NavRail 
                            className="hidden md:flex h-full" 
                            items={managerItems}
                        />
                        <main className="flex-1 overflow-y-auto rounded-xl bg-[--md-sys-color-surface]">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    );
} 