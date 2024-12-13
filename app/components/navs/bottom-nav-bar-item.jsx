import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * BottomNavBarItem component renders a navigation item for the bottom navigation bar.
 * It highlights the item if the current pathname matches the href prop.
 *
 * @param {Object} props - The properties object.
 * @param {Object} props.key
 * @param {string} props.href - The URL path that the navigation item links to.
 * @param {string} props.icon - The icon name to be displayed in the navigation item.
 * @param {string} props.text - The text label to be displayed under the icon.
 * @returns {JSX.Element} The rendered BottomNavBarItem component.
 */
export default function BottomNavBarItem(
    props
) {
    const pathname = usePathname();
    return (
        <div className="bottom-nav-item">
            <Link href={props.href} className="bottom-nav-item flex flex-col justify-center items-center w-full h-full" >
                <div className={`state-layer relative selected-${pathname === props.href} rounded-full`}>
                    <md-ripple></md-ripple>
                    <div className={`icon flex flex-col items-center text-center py-2 px-4 ${pathname === props.href ? "text-[--md-sys-color-primary]" : "text-[--md-sys-color-on-surface]"}`}>
                        <span className={`material-symbols-outlined${pathname === props.href ? "-filled" : ""}`}>{props.icon}</span>
                    </div>
                </div>
                <div className={`label transition-all duration-300 ease-in-out ${pathname == props.href ? "font-bold text-[--md-sys-color-primary] block" : "hidden"}`}>
                    <p>{props.text}</p>
                </div>
            </Link>
        </div>
    );
}