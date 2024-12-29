'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next/client';
import { useRouter } from 'next/navigation';
import TabButton from '@/app/components/buttons/tab-button';
import AccountSettingsPage from './account';

export default function Settings() {
    const router = useRouter();
    useEffect(() => {
        const accessToken = getCookie("session");
        if (!accessToken) {
            router.replace("/login");
        }
    }, [router]);

    const [activeTab, setActiveTab] = useState('general');

    const handleUpdateSettings = async (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const settings = Object.fromEntries(formData.entries());
        const response = await fetch('/api/user/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        }
        );
        return response.json();
    };

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-5">Settings</h1>
            <div className="tabs flex justify-around mb-5 relative w-fit">
                <TabButton className="rounded-t-sm" label="General" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                <TabButton className="rounded-t-sm" label="Account" isActive={activeTab === 'account'} onClick={() => setActiveTab('account')} />
                <TabButton className="rounded-t-sm" label="Privacy" isActive={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')} />
                <div
                    className={`absolute bottom-0 h-0.5 bg-[--md-sys-color-primary] transition-all duration-300 ease-in-out w-1/3
                        ${activeTab === 'general' ? 'left-0' : activeTab === 'account' ? 'left-1/3' : 'left-2/3'}`}
                />
            </div>
            <div className="tab-content w-full">
                {activeTab === 'general' && <></>}
                {activeTab === 'account' && <AccountSettingsPage />}
                {activeTab === 'privacy' && <div>Privacy Settings Content</div>}
            </div>
        </div>
    );
}