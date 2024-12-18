'use client';

import { useState } from 'react';
import Input from '@/app/components/inputs/input';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) throw new Error('Failed to send reset email');
            setIsSubmitted(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[--md-sys-color-background]">
            <div className="w-full max-w-md p-8 rounded-lg bg-[--md-sys-color-surface] shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center text-[--md-sys-color-on-surface]">
                    Reset Password
                </h1>
                
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Input
                                type="email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                label="Email"
                                leadingIcon="mail"
                                trailingIcon={email && 'check_circle'}
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
                            Send Reset Link
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-[--md-sys-color-primary] mb-4">
                            mail
                        </span>
                        <h2 className="text-xl font-semibold mb-2 text-[--md-sys-color-on-surface]">
                            Check your email
                        </h2>
                        <p className="text-[--md-sys-color-on-surface-variant]">
                            We&apos;ve sent a password reset link to {email}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}