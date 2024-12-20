'use client'
import TextButton from '@/app/components/buttons/text-button';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * SearchBox component renders a search input box with a search button.
 * 
 * @param {Object} props - The properties object.
 * @param {string} [props.className] - Optional additional class names for the search box.
 * @param {string} [props.placeholder] - Optional placeholder text for the input.
 * @param {string} [props.text] - Optional initial text value for the input.
 * @param {bool} [props.autoFocus] - Optional flag to set the input to autofocus.
 * @param {React.MutableRefObject} [props.ref]
 * @param {() => void} [props.onClick]
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange]
 * @returns {JSX.Element} The rendered search box component.
 */
export default function SearchBox(props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const params = new URLSearchParams(searchParams);
      params.set('q', e.target.value.trim());
      router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <Suspense>
      <div className={twMerge('search-box', props.className, "grow self-stretch justify-stretch h-full min-h-14 max-w-[720px]", 'bg-[--md-sys-color-surface-container] text-[--md-sys-color-on-surface-container] rounded-full')} role='search' onClick={() => { if (pathname !== "/search") router.push("/search") }}>
        <div className="state-layer relative rounded-full pl-6 pr-1 gap-1 min-h-14 flex items-center w-full">
          <md-ripple />
          <input
            className='border-1 outline-none bg-transparent flex-grow'
            type='text'
            placeholder={props.placeholder}
            value={props.text}
            ref={props.ref}
            onChange={props.onChange}
            onKeyPress={handleSearch}
          />
          <TextButton onClick={() => {
            if (props.ref?.current?.value.trim()) {
              const params = new URLSearchParams(searchParams);
              params.set('q', props.ref.current.value.trim());
              router.push(`/search?${params.toString()}`);
            }
          }}>
            <span className='material-symbols-outlined'>search</span>
          </TextButton>
        </div>
      </div>
    </Suspense>
  )
}