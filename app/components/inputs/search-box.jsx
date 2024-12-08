;
import TextButton from '@/app/components/buttons/text-button';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

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
    <div className={`search-box sm:grow sm:self-stretch sm:justify-stretch flex search-box rounded-full h-fit sm:h-14 sm:max-w-[720px] bg-[--md-sys-color-surface-container] text-[--md-sys-color-on-surface-container] ${props.className}`} role='search' onClick={()=>{if (pathname !== "/search") router.push("/search")}}>
      <div className="state-layer sm:self-stretch relative rounded-full sm:pl-6 sm:pr-1 sm:gap-1 flex items-center sm:w-full">
        <md-ripple />
        <input 
          className='border-1 outline-none bg-transparent sm:self-stretch flex-grow hidden sm:flex' 
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
  )
}