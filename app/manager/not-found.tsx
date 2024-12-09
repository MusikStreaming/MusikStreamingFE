'use client';

import Link from 'next/link';

export default function ManagerNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-[--md-sys-color-primary]">404</h1>
        <h2 className="text-2xl font-semibold text-[--md-sys-color-on-background]">
          Trang không tồn tại
        </h2>
        <p className="text-[--md-sys-color-on-surface-variant] max-w-md mx-auto">
          Có vẻ như trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/manager"
            className="px-6 py-2 bg-[--md-sys-color-primary] text-[--md-sys-color-on-primary] rounded-full hover:opacity-90 transition-opacity"
          >
            Quay lại trang chủ
          </Link>
          <Link
            href="/"
            className="px-6 py-2 border border-[--md-sys-color-outline] rounded-full hover:bg-[--md-sys-color-surface-container] transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
