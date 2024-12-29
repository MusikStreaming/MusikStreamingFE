import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function AccountSettingsPage() {
    const { data: user, isLoading, error } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch(`/api/user/profile`);
            if (!response.ok) throw new Error('Failed to fetch user');
            return response.json();
        },
    });

    const [formData, setFormData] = useState({
        username: '',
        country: '',
        file: null,
        avatarUrl: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                country: user.country || '',
                file: null,
                avatarUrl: user.avatarurl || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value, type, files } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'file' ? files?.[0] : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData();
        data.append('username', formData.username);
        data.append('country', formData.country);
        if (formData.file) {
            data.append('file', formData.file);
        }
        data.append('avatarUrl', formData.avatarUrl);

        const response = await fetch('/api/user/settings', {
            method: 'POST',
            body: data,
        });

        if (!response.ok) {
            console.error('Failed to update settings');
        } else {
            console.log('Settings updated successfully');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading user data</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded" aria-label="Username" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Country</label>
                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full p-2 border rounded" aria-label="Country" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Profile Picture</label>
                        <input type="file" name="file" onChange={handleChange} className="w-full p-2 border rounded" aria-label="Profile Picture" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Avatar URL</label>
                        <input type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} className="w-full p-2 border rounded" aria-label="Avatar URL" />
                    </div>
                </div>
            </section>

            <div className="flex justify-end space-x-4">
                <button type="button" className="px-4 py-2 border rounded" aria-label="Cancel">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded" aria-label="Save Changes">Save Changes</button>
            </div>
        </form>
    );
}