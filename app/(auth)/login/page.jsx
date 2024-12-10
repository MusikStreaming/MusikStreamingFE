'use client'
import GoogleLogin from '@/app/(auth)/login/google-login';
import Link from 'next/link';
// import { useReducer } from 'react';
import { login } from '@/app/services/auth.service';
import LoginForm from '@/app/(auth)/login/login-form';
import { getCookie, hasCookie } from 'cookies-next';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
// import {useTranslation} from 'next/translation';

/**
 * LoginPage component handles the login functionality.
 * It manages form state, validation, and submission.
 * 
 * @return {JSX.Element} The rendered login page component.
 * 
 * @example
 * // To use the LoginPage component, simply import and include it in your JSX:
 * import LoginPage from '@/app/(auth)/login/page';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <LoginPage />
 *     </div>
 *   );
 * }
 */
export default function LoginPage() {
    /**
     * Handles form submission.
     * @param {Object} event - The form submission event.
     * @return {Promise<void>} A promise that resolves when the form submission is complete.
     * 
     * @example
     * <form onSubmit={handleSubmit}>
     *   <input type="email" value={formData.email} onChange={handleEmailChange} />
     *   <input type="password" value={formData.password} onChange={handlePasswordChange} />
     *   <button type="submit">Login</button>
     * </form>
     */
    const router = useRouter();
    async function handleSubmit(formData) {
        try {
            const { email, password } = formData;
            console.log('Starting login process...');
            
            const res = await login({ email, password });
            console.log('Login response:', res);
            
            // Wait a brief moment for cookies to be set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Check both cookie existence and value
            const hasSession = hasCookie('session');
            const sessionValue = getCookie('session');
            
            console.log('Session status:', { hasSession, sessionValue });
            
            if (!hasSession || sessionValue !== 'true') {
                throw new Error('Đăng nhập thất bại: Không thể tạo phiên đăng nhập');
            }
            
            // Correctly handle the returnUrl
            const returnUrl = new URLSearchParams(window.location.search).get('returnUrl') || '/';
            window.location.href = returnUrl;
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            if (error?.response?.status === 401) {
                return { error: 'Đăng nhập thất bại: Sai tên đăng nhập hoặc mật khẩu' };
            }
            if (error?.message === 'Network Error') {
                return { error: 'Đăng nhập thất bại: Lỗi mạng, vui lòng thử lại sau' };
            }
            if (error?.message == "Email not confirmed") {
                router.push('/verify-email');
            }
            return { 
                error: typeof error === 'string' ? error : 
                       error?.message || 'Đăng nhập thất bại, vui lòng thử lại sau'
            };
        }
    }

    return (
        <div className="flex-col flex items-center justify-center max-w-[560px] w-[80vw] gap-6">
            <div className="self-stretch h-11 flex-col justify-center items-center gap-2.5 flex">
                <div className="text-[--md-sys-color-on-background] text-4xl font-bold">Đăng nhập</div>
            </div>
            <div className="py-4 flex-col justify-start items-center gap-9 flex">
                <Suspense fallback={<div>Loading...</div>}> 
                    <LoginForm onSubmit={handleSubmit}/>
                    <GoogleLogin/>
                </Suspense>
                <div className="text-center">
                    <span className="text-[--md-sys-color-on-background] text-sm font-medium leading-tight tracking-tight">
                        Chưa có tài khoản? Đăng ký tài khoản
                    </span>
                    <span className="text-black text-sm font-medium leading-tight tracking-tight"> </span>
                    <Link href={"/sign-up"} className="text-[--md-sys-color-primary] text-sm font-medium leading-tight tracking-tight">tại đây</Link></div>
            </div >
        </div >
    );
}