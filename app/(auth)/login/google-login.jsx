'use client'

import { signInWithGoogle } from '@/app/services/auth.service';

import '@material/web/textfield/outlined-text-field'
import '@material/web/icon/icon'
import '@material/web/iconbutton/icon-button'
import OutlinedButton from "@/app/components/buttons/outlined-button"

export default function GoogleLogin({ returnUrl }) {
  return (
    <div className="self-stretch h-[68px] flex-col justify-start items-center gap-3 flex">
      <div className="h-4 text-center text-[--md-sys-color-on-background] text-sm font-medium leading-tight tracking-tight">hoặc</div>
      <OutlinedButton
        onClick={() => signInWithGoogle(returnUrl)}
        showLeadingImg={true}
        leadingImg={{
          src: "/assets/google-icon.png",
          alt: 'Đăng nhập với Google',
          width: 24
        }}
        className='max-w-[560px] w-[80vw]'>
        Đăng nhập với Google
      </OutlinedButton>
    </div>
  )
}