'use client';
import axios from 'axios';
import z from 'zod';
import { setCookie, deleteCookie } from 'cookies-next/client';
import { FileWithPath } from 'react-dropzone';
import { redirect } from 'next/navigation';

interface SignUpData {
    email: string;
    password: string;
    name: string;
    country: string;
    avatar?: File;
}

interface LoginData {
    email: string;
    password: string;
}

interface AuthResponse {
    user: {
        id: string;
        aud: string;
        role?: string;
        username?: string;
    }
    session?: {
        access_token?: string;
        expires_in?: number;
        refresh_token?: string;
    }
}

const AuthResponse = z.object({
    user: z.object({
        id: z.string(),
        aud: z.string(),
        role: z.string().optional(), // User, Admin, Artist Manager
        username: z.string().optional(),
    }),
    session: z.object({
        access_token: z.string().optional(),
        expires_in: z.number().optional(),
        refresh_token: z.string().optional(),
    }).optional(),
})

const AuthResponseError = z.object({
    error: z.string(),
})

async function countryFromCoords(coords: GeolocationCoordinates): Promise<string> {
    const { latitude, longitude } = coords;
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const country = response.data.address.country_code;
    return country;
}

async function getCountryCode(): Promise<string> {
    if (typeof window === 'undefined') {
        return '';
    }

    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const country = await countryFromCoords(position.coords);
                        resolve(country);
                    } catch (error) {
                        console.error('Error getting country from coords:', error);
                        resolve('');
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    resolve('');
                }
            );
        } else {
            resolve('');
        }
    });
}

export async function signUp(data: SignUpData): Promise<AuthResponse> {
    const country = await getCountryCode();
    data.country = country;
    
    try {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('name', data.name);
        formData.append('country', data.country);
        
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/signup`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                },
            }
        );

        if (response.status !== 200) {
            const resError = AuthResponseError.parse(response.data);
            throw new Error(resError.error);
        }

        const resData = AuthResponse.parse(response.data);
        if (resData.session) {
            setCookie('access_token', resData.session.access_token, {
                expires: new Date(Date.now() + (resData.session.expires_in ?? 3600) * 1000),
                path: '/',
            });
            setCookie('refresh_token', resData.session.refresh_token, {
                expires: new Date(Date.now() + (resData.session.expires_in ?? 3600) * 1000),
                path: '/',
            });
            setCookie('user_name', resData.user.username, {
                expires: new Date(Date.now() + (resData.session.expires_in ?? 3600) * 1000),
                path: '/',
            });
            setCookie('role', resData.user.role, {
                expires: new Date(Date.now() + (resData.session.expires_in ?? 3600) * 1000),
                path: '/',
            });
        }
        return resData;
    } catch (error: unknown) {
        console.error(error);
        throw new Error('Sign up failed: ' + (error instanceof Error ? error.message : String(error)));
    }
}


export async function login(data: LoginData): Promise<AuthResponse> {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/signin`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        if (response.status !== 200) {
            const resError = AuthResponseError.parse(response.data);
            throw new Error(resError.error);
        }
        const resData = AuthResponse.parse(response.data);
        
        if (!resData.session) {
            return resData;
        }

        // Calculate expiration date with default 1 hour expiration
        const expires = new Date(Date.now() + (resData.session.expires_in ?? 3600) * 1000);

        const cookiesOptions = {
            expires,
            path: '/',
            sameSite: 'strict' as const,
            secure: process.env.NODE_ENV === 'production',
            maxAge: resData.session.expires_in
        }
        
        // Set client-side cookies with proper attributes
        setCookie('access_token', resData.session.access_token, cookiesOptions);
        setCookie('refresh_token', resData.session.refresh_token, cookiesOptions);
        setCookie('user_name', resData.user.username, cookiesOptions);
        setCookie('role', resData.user.role, {
            expires,
            path: '/',
            sameSite: 'strict' as const,
            secure: process.env.NODE_ENV === 'production',
            maxAge: resData.session.expires_in
        });
        return resData;
    } catch (error: unknown) {
        console.error(error);
        throw new Error('Login failed: ' + (error instanceof Error ? error.message : String(error)));
    }
}

export async function verifyEmail(token: string): Promise<void> {
    try {
        const response = await axios.post(
            `${process.env.API_URL}/v1/auth/verify-email`,
            { token },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.status !== 200) {
            throw new Error('Email verification failed');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Email verification failed');
    }
}

export function redirectToLogin(returnUrl?: string) {
    //validate returnUrl
    if (returnUrl && !returnUrl.startsWith('/')) {
        returnUrl = '/';
    }
    const loginPath = returnUrl 
        ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : '/login';
        
    if (typeof window === 'undefined') {
        redirect(loginPath);
    } else {
        window.location.href = loginPath;
    }
}

let authListeners: ((isAuthenticated: boolean) => void)[] = [];

export const addAuthListener = (listener: (isAuthenticated: boolean) => void) => {
  authListeners.push(listener);
};

export const removeAuthListener = (listener: (isAuthenticated: boolean) => void) => {
  authListeners = authListeners.filter(l => l !== listener);
};

export const notifyAuthChange = (isAuthenticated: boolean) => {
  authListeners.forEach(listener => listener(isAuthenticated));
};

export const logout = () => {
  // Clear all auth cookies
  // Delete all auth cookies first
  deleteCookie('access_token');
  deleteCookie('refresh_token');
  deleteCookie('user_name');
  deleteCookie('role');

  // Wait for cookies to be deleted before proceeding
  setTimeout(() => {
    // Notify listeners of auth change
    notifyAuthChange(false);

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    else {
      redirect('/login');
    }
  }, 100);
};
