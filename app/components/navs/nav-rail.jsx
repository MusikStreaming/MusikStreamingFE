'use client';
import PropTypes from 'prop-types';
import NavRailCommonItem from './nav-rail-common-item';
import NavRailPinnedItem from './nav-rail-pinned-item';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import "./nav-rail.css";
import { NavItemType } from '@/app/model/nav-item-type';
import { getCookie } from 'cookies-next';
import { hasCookie } from 'cookies-next/client';

/**
 * Navigation items configuration.
 */
const items = {
    'home': {
      text: 'Trang chủ',
      badgevalue: 0,
      href: '/',
      type: NavItemType.DEFAULT
    },
    'explore': {
      text: "Khám phá", 
      badgevalue: 0,
      href: "/search",
      type: NavItemType.DEFAULT
    },
    'library_music': {
      text: 'Thư viện của bạn',
      badgevalue: 0,
      href: '/library',
      type: NavItemType.DEFAULT
    },
    'settings': {
      text: 'Cài đặt',
      badgevalue: 0,
      href: '/settings',
      type: NavItemType.DEFAULT
    },
  };

/**
 * NavRail component renders a navigation rail with common and pinned items.
 * @param {Object} props - Component properties.
 * @param {string} [props.className] - Additional class names for the component.
 * @param {Object} [props.pinned] - Pinned navigation items.
 * @param {number} [props.selected] - Index of the selected item.
 */
export default function NavRail({ className, items: customItems }) {
    const [extended, setExtended] = useState(true);
    const [windowWidth, setWindowWidth] = useState(0);
    const [pinnedItems, setPinnedItems] = useState({});
    const [width, setWidth] = useState(280); // Default width
    const [isResizing, setIsResizing] = useState(false);
    const navRef = useRef(null);
    const pathname = usePathname();
    const [prevPathname, setPrevPathname] = useState(pathname);
    const [animationDirection, setAnimationDirection] = useState('slide-left');

    const handleResize = useCallback(() => {
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            if (window.innerWidth < 1024) {
                setExtended(false);
            } else {
                setExtended(true);
            }
        }
    }, []);

    // Handle tab transitions
    useEffect(() => {
        if (prevPathname !== pathname) {
            // Determine animation direction based on navigation order
            const prevIndex = Object.values(items).findIndex(item => item.href === prevPathname);
            const currentIndex = Object.values(items).findIndex(item => item.href === pathname);
            
            if (prevIndex < currentIndex) {
                setAnimationDirection('slide-left');
            } else {
                setAnimationDirection('slide-right');
            }
            
            setPrevPathname(pathname);
        }
    }, [pathname, prevPathname]);

    useEffect(() => {
        const checkAuth = () => {
            const accessToken = getCookie("access_token");
            
            // If logged in, set up pinned items
            if (accessToken) {
                setPinnedItems({
                    'favorite': {
                        text: 'Yêu thích',
                        href: '/favorites',
                        img: {
                            src: '/assets/favorite.jpg',
                            width: 48
                        },
                        type: NavItemType.DEFAULT
                    },
                    'playlist': {
                        text: 'Playlist của bạn',
                        href: '/playlists',
                        img: {
                            src: '/assets/playlist.jpg',
                            width: 24
                        },
                        type: NavItemType.DEFAULT
                    }
                });
            } else {
                setPinnedItems({});
            }
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        
        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize window width
            setWindowWidth(window.innerWidth);
            // Initialize 'extended' state from localStorage or window width
            const storedExtended = localStorage.getItem('nav-rail-extended');
            if (storedExtended !== null) {
                setExtended(JSON.parse(storedExtended));
            } else {
                setExtended(window.innerWidth >= 1024);
            }
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [handleResize]);

    // Add resize handler
    const startResizing = useCallback((e) => {
        e.preventDefault();
        setIsResizing(true);
    }, []);

    const resize = useCallback((e) => {
        if (isResizing && navRef.current) {
            requestAnimationFrame(() => {
                const rect = navRef.current.getBoundingClientRect();
                const newWidth = e.clientX - rect.left;
                
                // If width is less than threshold, collapse the nav rail
                if (newWidth < 200) {
                    setExtended(false);
                    localStorage.setItem('nav-rail-extended', 'false');
                    navRef.current.style.width = '80px';
                    setWidth(80);
                    return;
                }
                
                // If nav rail is collapsed and width exceeds threshold, expand it
                if (!extended && newWidth >= 200) {
                    setExtended(true);
                    localStorage.setItem('nav-rail-extended', 'true');
                    navRef.current.style.width = '280px';
                    setWidth(280);
                    return;
                }
                
                // Only allow resizing when extended
                if (extended) {
                    const clampedWidth = Math.min(600, Math.max(280, newWidth));
                    navRef.current.style.width = `${clampedWidth}px`;
                    setWidth(clampedWidth);
                }
            });
        }
    }, [isResizing, extended]);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
        if (navRef.current) {
            const finalWidth = navRef.current.offsetWidth;
            if (extended) {
                localStorage.setItem('nav-rail-width', finalWidth);
                setWidth(finalWidth);
            }
        }
    }, [extended]);

    // Load saved width on mount
    useEffect(() => {
        const savedWidth = localStorage.getItem('nav-rail-width');
        if (savedWidth) {
            setWidth(Number(savedWidth));
        }
    }, []);

    // Add event listeners for resize
    useEffect(() => {
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResizing);
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [resize, stopResizing]);

    // Use customItems if provided, otherwise use default items
    const navigationItems = customItems || items;
    
    const showPinnedSection = !customItems; // Only show pinned section when using default items

    return (                                                                 
        <div 
            ref={navRef}
            style={extended ? { width: `${width}px` } : {}}
            className={`${className} nav-rail ${windowWidth < 768 ? "hidden" : "flex"} w-full relative flex-col bg-[--md-sys-color-surface-container-low] rounded-2xl nav-rail-${extended ? 'extended' : 'collapsed'} ${animationDirection}`}
        >
            <div 
                className="resize-handle" 
                onMouseDown={startResizing}
            />
            <div className={`nav-rail-inner h-full nav-rail--padding-${extended ? 'extended' : 'collapsed'}`}>
                <button className={`extend-button selected-false rounded-full w-full`} role="button" onClick={() => { 
                    localStorage.setItem('nav-rail-extended', JSON.stringify(!extended));
                    setExtended(!extended);
                }}>
                    <div className={`state-layer rounded-full flex gap-4 relative padding-${extended ? "extended" : "collapsed"}`}>
                        <md-ripple/>
                        <span className="material-symbols-outlined block w-6">menu</span>
                        <span className={`extended-${extended}`}>Menu</span>
                    </div>
                </button>
                <div className="nav-rail-common flex-col mb-4">
                    {
                        Object.keys(navigationItems).map((key) => {
                            const item = navigationItems[key];
                            
                            const imgSrc = item.img?.src || "/favicon.ico";
                            if (navigationItems[key].type === 0)
                                return <NavRailCommonItem
                                    key={key}
                                    icon={key}
                                    text={navigationItems[key].text}
                                    showBadge={navigationItems[key].badgevalue > 0}
                                    badgevalue={navigationItems[key].badgevalue}
                                    selected={pathname === navigationItems[key].href}
                                    href={navigationItems[key].href}
                                    extended={extended}
                                />
                            else if (navigationItems[key].type === 1)
                                return <NavRailPinnedItem
                                    key={key}
                                    imgSrc={imgSrc}
                                    text={navigationItems[key].text}
                                    width={navigationItems[key].img.width}
                                    selected={pathname === navigationItems[key].href}
                                    href={navigationItems[key].href}
                                    extended={extended}
                                />
                        })
                    }
                </div>
                
                {showPinnedSection && (
                    <>
                        <div className="px-4">
                            <hr className='border-[--md-sys-color-outline-variant]'/>
                        </div>
                        <div className={`nav-rail-pinned flex-col ${extended ? "gap-0" : "gap-2"} h-fit flex`}>
                            {
                                (hasCookie('access_token')) &&
                                Object.keys(pinnedItems).map((key) => {
                                    const pinned = pinnedItems[key];
                                    const imgSrc = pinned.img?.src || "/favicon.ico";

                                    return <NavRailPinnedItem
                                        key={key}
                                        imgSrc={imgSrc}
                                        text={pinnedItems[key].text}
                                        width={pinnedItems[key].img.width}
                                        href={pinnedItems[key].href}
                                        extended={extended}
                                        selected={pathname === pinnedItems[key].href}
                                    />
                                })
                            }
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

NavRail.propTypes = {
    className: PropTypes.string,
    items: PropTypes.objectOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        badgevalue: PropTypes.number.isRequired,
        href: PropTypes.string.isRequired,
        type: PropTypes.number.isRequired,
        img: PropTypes.shape({
            src: PropTypes.string,
            width: PropTypes.number
        })
    })),
    pinned: PropTypes.object,
    selected: PropTypes.number
};