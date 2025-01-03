'use client';

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import OutlinedIcon from "@/app/components/icons/outlined-icon";

export default function VerifyEmailPage() {
    const router = useRouter();
  return(
    <Suspense>
        <div className='flex flex-col items-left justify-center h-screen gap-8 w-1/2 max-w-md'>
            <h1 className='text-2xl font-bold'>Cảm ơn bạn đã đăng ký dịch vụ MusikStreaming</h1>
            <div className="flex flex-col gap-2">
                <p className='text-sm text-[--md-sys-color-on-surface-variant]'>Chúng tôi đã gửi email xác nhận đến email của bạn. Vui lòng kiểm tra email và xác nhận để hoàn tất quá trình đăng ký.</p>
            </div>
            <div className="flex flex-col gap-4">
                <div className='bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-full p-2 flex items-center gap-2'>
                    <OutlinedIcon icon="check_circle"/>
                    <span>Xác nhận email</span>
                </div>
                {/* <button className='text-sm text-[--md-sys-color-secondary] rounded-full p-0' onClick={() => {
                    setCookie('skipVerifyEmail', true, { maxAge: 24 * 60 * 60 });
                    router.push('/');
                }}>
                    Tiếp tục mà không cần xác nhận email
                </button> */}
            </div>
        </div>
    </Suspense>
  )
}