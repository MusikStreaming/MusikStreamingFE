'use client';
import BrowseCard from '@/app/components/browse/browse-card';
import ScalableSearchBox from '@/app/components/inputs/scalable-search-box';
import { useRef, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useScreenWidth from '@/app/hooks/useScreenWidth';
import BrowseContainer from './browse-container';
import ResultMobile from './result-mobile';
import ResultDesktop from './result-desktop';
import debounce from 'lodash/debounce';
import { useSearch } from '@/app/hooks/useSearch';

export default function SearchPage() {
    const pathname = usePathname();
    const router = useRouter();
    const { searchQuery, handleSearchChange } = useSearch();
    const searchFocus = useRef<HTMLInputElement>(null);
    const screenWidth = useScreenWidth();

    useEffect(() => {
        if (pathname == "/search" && searchFocus.current) {
            searchFocus.current.focus();
        }
    }, [pathname]);

    return (
        <div className='flex flex-col w-full'>
            <ScalableSearchBox
                className='md:hidden bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface]'
                placeholder="Search"
                autoFocus={true}
                ref={searchFocus}
                text={searchQuery}
                onChange={handleSearchChange}
            />
            <div className="p-4">
                {searchQuery?.trim() ? (
                    screenWidth < 768 ? <ResultMobile query={searchQuery} /> : <ResultDesktop query={searchQuery} />
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6">Discover</h2>
                        <BrowseContainer />
                    </>
                )}
            </div>
        </div>
    );
}