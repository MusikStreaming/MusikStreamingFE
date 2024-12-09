'use client'
import React, { Suspense } from 'react';
import FilledButton from '@/app/components/buttons/filled-button';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
import { useReducer, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginForm({
    onSubmit
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    if (getCookie("session")) {
        router.push("/")
    }
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // password should be at least 10 characters and contain a letter
    const PASSWORD_REGEX = /^(?=.*[A-Za-z]).{10,}$/;
    const formReducer = (state, action) => {
        switch (action.type) {
            case "setFormData":
                return { ...state, formData: action.payload };
            case "setErrors":
                return {...state, errors: action.payload};
            case "setStatus":
                return {...state, status: action.payload};
        }
    }
    
    const [revealedPassword, setRevealedPassword] = useState(false);

    const initialValue = {
        formData: {
            email: "",
            password: ""
        },
        errors: {
            email: false,
            password: false,
            general: false
        },
        status: {
            isLoading: false,
            errorMessage: null
        }
    }

    const [state, dispatch] = useReducer(formReducer, initialValue);

    /**
     * Handles changes to the email input field.
     * @param {Object} event - The input change event.
     * @return {void}
     * 
     * @example
     * <input type="email" onChange={handleEmailChange} />
     */
    function handleEmailChange() {
        dispatch({
            type: "setFormData",
            payload: { ...state.formData, email: event.target.value }
        })
        dispatch({
            type: "setErrors",
            payload: {...state.errors, email: !event.target.value.match(EMAIL_REGEX), general: false}
        })
    }

    /**
     * Handles changes to the password input field.
     * @param {Object} event - The input change event.
     * @return {void}
     * 
     * @example
     * <input type="password" onChange={handlePasswordChange} />
     */
    function handlePasswordChange(event) {
        dispatch({
            type: "setErrors",
            payload: { ...state.errors, password: !event.target.value.match(PASSWORD_REGEX), general: false }
        })
        dispatch({
            type: "setFormData",
            payload: { ...state.formData, password: event.target.value }
        })
    }

    const waitForCookies = async (cookieName, maxAttempts = 10) => {
        for (let i = 0; i < maxAttempts; i++) {
            if (getCookie(cookieName)) return true;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        return false;
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        dispatch({ type: "setStatus", payload: { isLoading: true, errorMessage: null } });
        
        try {
            const result = await onSubmit({
                email: state.formData.email,
                password: state.formData.password
            });
            
            if (result?.error) {
                dispatch({ 
                    type: "setStatus", 
                    payload: { 
                        isLoading: false, 
                        errorMessage: result.error 
                    } 
                });
            } else if (result?.success) {
                // Redirect will be handled by the parent component
                window.location.href = searchParams.get('returnUrl') || '/';
            }
        } catch (error) {
            dispatch({ 
                type: "setStatus", 
                payload: { 
                    isLoading: false, 
                    errorMessage: error.message || 'Đăng nhập thất bại, vui lòng thử lại sau' 
                } 
            });
        }
    };

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <form onSubmit={handleFormSubmit} className="flex-col justify-start items-center gap-6 flex self-stretch">
                <div className="flex-col justify-stretch items-start gap-3 flex">
                    <md-outlined-text-field
                        error={state.errors.email || state.errors.general}
                        className='max-w-[560px] w-[80vw]'
                        label="Email của bạn"
                        value={state.formData.email}
                        placeholder='youremail@example.com'
                        type='email'
                        onInput={handleEmailChange}
                        pattern="^\S+@\S+\.\S+$"
                    >
                        <md-icon slot="leading-icon">email</md-icon>
                    </md-outlined-text-field>
                    <md-outlined-text-field
                        error={state.errors.password || state.errors.general}
                        label="Mật khẩu"
                        placeholder="Nhập mật khẩu"
                        value={state.formData.password}
                        type={revealedPassword ? "text" : "password"}
                        className="max-w-[560px] w-[80vw]"
                        onInput={handlePasswordChange}
                    >
                        <md-icon slot="leading-icon">password</md-icon>
                        <md-icon slot="trailing-icon" onClick={() => setRevealedPassword(!revealedPassword)}>{revealedPassword ? "visibility" : "visibility_off"}</md-icon>
                    </md-outlined-text-field>
                    <Link className='text-center font-medium w-full block text-[--md-sys-color-primary]' href={"/forgot-password"}>Quên mật khẩu? Lấy lại mật khẩu tại đây</Link>
                </div>
                <div className="max-w-[560px] w-[80vw] flex flex-col gap-4 items-center justify-stretch">
                    <FilledButton
                        type="submit"
                        disabled={state.status.isLoading}
                        className='max-w-[560px] w-[80vw]'
                    >
                        {state.status.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </FilledButton>
                    {state.status.errorMessage && (
                        <div className="text-[--md-sys-color-error] text-sm">
                            {state.status.errorMessage}
                        </div>
                    )}
                </div>
            </form>
        </Suspense>
    )

}