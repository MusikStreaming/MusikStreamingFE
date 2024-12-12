'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManagerDashboard() {
    const [stats, setStats] = useState({
        totalSongs: 0,
        totalAlbums: 0,
        totalPlays: 0
    });
    const [isManager, setIsManager] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkManagerStatus = async () => {
            try {
                const response = await fetch('/api/auth/user-info', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    throw new Error('Failed to check manager status');
                }
                const { manager } = await response.json();
                if (!manager) {
                    router.push('/');
                } else {
                    setIsManager(true);
                }
            } catch (error) {
                console.error('Error checking manager status:', error);
                router.push('/');
            }
        };

        checkManagerStatus();
    }, [router]);

    useEffect(() => {
        if (isManager) {
            // TODO: Fetch actual stats from your API
            setStats({
                totalSongs: 42,
                totalAlbums: 5,
                totalPlays: 10000
            });
        }
    }, [isManager]);

    if (!isManager) {
        return null;
    }

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-[--md-sys-color-on-background]">
                    Bảng điều khiển
                </h1>
                <Link 
                    href="/"
                    className="text-[--md-sys-color-primary] hover:text-[--md-sys-color-primary-hover] transition-colors hidden md:block"
                >
                    Thoát chế độ quản lý
                </Link>
                <Link 
                    href="/"
                    className="text-[--md-sys-color-primary] hover:text-[--md-sys-color-primary-hover] transition-colors block md:hidden too"
                    toolTip="Exit manager mode"
                >
                    <span className='material-symbols-outlined-filled'>
                        logout
                    </span>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-[--md-sys-color-surface-container]">
                    <h3 className="text-lg font-semibold mb-2 text-[--md-sys-color-on-surface]">
                        Tổng số bài hát
                    </h3>
                    <p className="text-2xl text-[--md-sys-color-on-surface]">
                        {stats.totalSongs}
                    </p>
                </div>
                <div className="p-4 rounded-lg bg-[--md-sys-color-surface-container]">
                    <h3 className="text-lg font-semibold mb-2 text-[--md-sys-color-on-surface]">
                        Tổng số album
                    </h3>
                    <p className="text-2xl text-[--md-sys-color-on-surface]">
                        {stats.totalAlbums}
                    </p>
                </div>
                <div className="p-4 rounded-lg bg-[--md-sys-color-surface-container]">
                    <h3 className="text-lg font-semibold mb-2 text-[--md-sys-color-on-surface]">
                        Lượt phát
                    </h3>
                    <p className="text-2xl text-[--md-sys-color-on-surface]">
                        {stats.totalPlays}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-[--md-sys-color-surface-container]">
                    <h2 className="text-xl font-bold mb-4 text-[--md-sys-color-on-surface]">
                        Hoạt động gần đây
                    </h2>
                    {/* Add recent activity content */}
                </div>
                <div className="p-4 rounded-lg bg-[--md-sys-color-surface-container]">
                    <h2 className="text-xl font-bold mb-4 text-[--md-sys-color-on-surface]">
                        Thao tác nhanh
                    </h2>
                    <div className="flex flex-col gap-2">
                        <Link 
                            href="/manager/discography"
                            className="p-2 rounded text-[--md-sys-color-on-surface] hover:bg-[--md-sys-color-surface-container-high] transition-colors"
                        >
                            Quản lý discography
                        </Link>
                        <Link 
                            href="/manager/settings"
                            className="p-2 rounded text-[--md-sys-color-on-surface] hover:bg-[--md-sys-color-surface-container-high] transition-colors"
                        >
                            Cài đặt tài khoản
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
