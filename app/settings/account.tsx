'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Dropdown from '../components/inputs/dropdown';
import DragNDropZone from '../components/inputs/dragndropzone';
import countryList from 'react-select-country-list';
import Input from '../components/inputs/outlined-input';
import OutlinedButton from '../components/buttons/outlined-button';
import FilledButton from '../components/buttons/filled-button';
import OutlinedIcon from '../components/icons/outlined-icon';

interface FormData {
    username: string;
    country: string;
    file: File | null;
}

interface User {
    username: string;
    country: string;
    avatarurl: string;
}

export default function AccountSettingsPage() {
    const countries = useMemo(() => countryList().getData(), []);
    const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string; } | null>(null);
    const [updateStatus, setUpdateStatus] = useState<{
        type: 'success' | 'error' | null;
        message: string;
    }>({ type: null, message: '' });

    const { data: user, isLoading, error } = useQuery<User>({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await fetch(`/api/user/profile`);
            if (!response.ok) throw new Error('Failed to fetch user');
            return response.json();
        },
    });

    const [formData, setFormData] = useState<FormData>({
        username: '',
        country: '',
        file: null,
    });

    useEffect(() => {
        if (user && countries.length > 0) {
            // Find the country object that matches the user's country code
            const userCountry = countries.find(c => c.value === user.country) || countries[0];

            setFormData(prev => ({
                ...prev,
                username: user.username || '',
                country: userCountry.value,
                avatarPreview: user.avatarurl || '',
            }));

            setSelectedCountry(userCountry);
        }
    }, [user, countries]);

    const handleDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        setFormData(prev => ({
            ...prev,
            file,
            avatarPreview: URL.createObjectURL(file)
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateStatus({ type: null, message: '' });
        const data = new FormData();
        data.append('username', formData.username);
        data.append('country', formData.country);
        if (formData.file) {
            data.append('file', formData.file);
        }

        try {
            const response = await fetch('/api/user/settings', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }
            setUpdateStatus({ 
                type: 'success', 
                message: 'Settings updated successfully!' 
            });
        } catch (error) {
            console.error('Error updating settings:', error);
            setUpdateStatus({ 
                type: 'error', 
                message: 'Failed to update settings. Please try again.' 
            });
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading user data</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center">
                <DragNDropZone
                    onDrop={handleDrop}
                    avatarPreview={formData.file ? URL.createObjectURL(formData.file) : user?.avatarurl}
                    supportText="Drop your profile picture here or click to select"
                    supportedTypes={{ 'image/*': ['.jpeg', '.png'] }}
                />
            </div>

            <div className="space-y-4">
                <div>
                    <Input
                        label="Username"
                        value={formData.username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full"
                        leadingIcon={null}
                        trailingIcon={null}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <Dropdown
                        options={countries}
                        value={selectedCountry}
                        defaultValue={selectedCountry}
                        onChange={(option: { value: string; label: string }) => {
                            setSelectedCountry(option);
                            setFormData(prev => ({ ...prev, country: option.value }));
                        }}
                    />
                </div>
            </div>

            {updateStatus.type && (
                <div className={`p-4 rounded-lg ${
                    updateStatus.type === 'success' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-[--md-sys-color-error-container] text-[--md-sys-color-on-error-container]'
                } flex items-center gap-2`}>
                    {updateStatus.type === 'success' ? <OutlinedIcon icon={"check"}/> : <OutlinedIcon icon={"error"}/>} {updateStatus.type === 'success' ? 'Thay đổi thông tin thành công' : 'Lỗi khi thay đổi, có thể do trục trặc kết nối hoặc tên người dùng đã tồn tại.'}
                </div>
            )}

            <div className="flex justify-end gap-4">
                <OutlinedButton type="button" onClick={() => window.history.back()}>
                    Cancel
                </OutlinedButton>
                <FilledButton type="submit" onClick={handleSubmit}>
                    Save Changes
                </FilledButton>
            </div>
        </form>
    );
}