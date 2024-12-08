'use client';

import { useMedia } from '@/app/contexts/media-context';
import { twMerge } from 'tailwind-merge';

export default function PassiveProgress(props:{
    className?: string;
}) {
    const { currentSong, progress } = useMedia();
    const progressPercentage = currentSong?.duration ? (progress / currentSong.duration) * 100 : 0;

    return (
        <div className={twMerge(
            'passive-progress w-full bg-[--md-sys-color-outline] h-1 items-center',
            props.className
        )}>
            <div className="passive-progress-bar-track w-full h-full">
                <div 
                    className="passive-progress-bar-inner bg-[--md-sys-color-primary-fixed] h-full transition-all duration-200"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
}