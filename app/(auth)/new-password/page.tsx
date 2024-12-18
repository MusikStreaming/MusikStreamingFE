'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/app/components/inputs/input';

export default function NewPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            if (!response.ok) throw new Error('Failed to reset password');
            
            setIsSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError('Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--md-sys-color-background]">
            <div className="w-full max-w-md p-8 rounded-lg bg-[--md-sys-color-surface] shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center text-[--md-sys-color-on-surface]">
                    Set New Password
                </h1>

                {!isSuccess ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Input
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                label="New Password"
                                leadingIcon="lock"
                                trailingIcon={password && 'visibility'}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                label="Confirm Password"
                                leadingIcon="lock"
                                trailingIcon={confirmPassword && 'visibility'}
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-[--md-sys-color-error] text-sm mb-4">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-full hover:opacity-90 transition-opacity"
                        >
                            Reset Password
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-[--md-sys-color-primary] mb-4">
                            check_circle
                        </span>
                        <h2 className="text-xl font-semibold mb-2 text-[--md-sys-color-on-surface]">
                            Password Reset Successfully
                        </h2>
                        <p className="text-[--md-sys-color-on-surface-variant]">
                            Redirecting to login page...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
