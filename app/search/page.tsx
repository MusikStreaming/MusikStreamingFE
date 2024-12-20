'use client';
import SearchBox from '@/app/components/inputs/search-box';
import { useRef, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import useScreenWidth from '@/app/hooks/useScreenWidth';
import BrowseContainer from './browse-container';
import ResultMobile from './result-mobile';
import ResultDesktop from './result-desktop';
import { useSearch } from '@/app/hooks/useSearch';
import { twMerge } from 'tailwind-merge';
import Loading from './loading';

export default function SearchPage() {
    const pathname = usePathname();
    const { searchQuery, handleSearchChange } = useSearch();
    const searchFocus = useRef<HTMLInputElement>(null);
    const screenWidth = useScreenWidth();

    useEffect(() => {
        if (pathname == "/search" && searchFocus.current) {
            searchFocus.current.focus();
        }
    }, [pathname]);

    return (

        <Suspense>
            <div className='flex flex-col w-full'>
                <SearchBox
                    className={twMerge('md:hidden', 'bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface]')}
                    placeholder="Search"
                    autoFocus={true}
                    ref={searchFocus}
                    text={searchQuery}
                    onChange={handleSearchChange}
                />
                <div className="p-4">
                    <Suspense>
                        {searchQuery?.trim() ? (
                            screenWidth < 768 ? <ResultMobile query={searchQuery} /> : <ResultDesktop query={searchQuery} />
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-6">Discover</h2>
                                <BrowseContainer />
                            </>
                        )}
                    </Suspense>
                </div>
            </div>
        </Suspense>
    );
}