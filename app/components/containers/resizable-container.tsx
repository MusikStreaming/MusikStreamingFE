'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableContainerProps {
    children: React.ReactNode;
    className?: string;
    defaultWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    storageKey?: string;
    onWidthChange?: (width: number) => void;
}

export default function ResizableContainer({
    children,
    className = '',
    defaultWidth = 280,
    minWidth = 280,
    maxWidth = 600,
    storageKey,
    onWidthChange
}: ResizableContainerProps) {
    const [width, setWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load saved width on mount
    useEffect(() => {
        if (storageKey) {
            const savedWidth = localStorage.getItem(storageKey);
            if (savedWidth) {
                setWidth(Number(savedWidth));
            }
        }
    }, [storageKey]);

    const startResizing = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing && containerRef.current) {
            requestAnimationFrame(() => {
                const rect = containerRef.current!.getBoundingClientRect();
                const newWidth = e.clientX - rect.left;
                const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));
                
                containerRef.current!.style.width = `${clampedWidth}px`;
                setWidth(clampedWidth);
                onWidthChange?.(clampedWidth);
            });
        }
    }, [isResizing, maxWidth, minWidth, onWidthChange]);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        if (containerRef.current && storageKey) {
            const finalWidth = containerRef.current.offsetWidth;
            localStorage.setItem(storageKey, finalWidth.toString());
            setWidth(finalWidth);
        }
    }, [storageKey]);

    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            style={{ width: `${width}px` }}
        >
            {children}
            <div 
                className="absolute right-[-4px] top-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-[--md-sys-color-outline-variant] active:bg-[--md-sys-color-outline] active:w-2 active:right-[-1px] transition-all duration-150 z-10"
                onMouseDown={startResizing}
            />
        </div>
    );
}
