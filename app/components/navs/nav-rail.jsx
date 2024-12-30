'use client';
import PropTypes from 'prop-types';
import NavRailCommonItem from './nav-rail-common-item';
import NavRailPinnedItem from './nav-rail-pinned-item';
import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
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

  const managerItems = {
    'dashboard': {
        text: 'Bảng điều khiển',
        icon: 'dashboard',
        badgevalue: 0,
        href: '/manager',
        type: 0
    },
    'album': {
        text: 'Discography',
        icon: 'album',
        badgevalue: 0,
        href: '/manager/discography',
        type: 0
    },
    'settings': {
        text: 'Cài đặt',
        icon: 'settings',
        badgevalue: 0,
        href: '/manager/settings',
        type: 0
    }
}

const adminItems = {
    'admin_dashboard': {
        text: 'Admin Dashboard',
        icon: 'admin_panel_settings',
        badgevalue: 0,
        href: '/admin',
        type: 0
    },
    'user_management': {
        text: 'User Management',
        icon: 'group',
        badgevalue: 0,
        href: '/admin/users',
        type: 0
    },
    'admin_settings': {
        text: 'Admin Settings',
        icon: 'settings',
        badgevalue: 0,
        href: '/admin/settings',
        type: 0
    }
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
        const checkAuth = () => {
            const session = getCookie("session");
            
            // If logged in, set up pinned items
            if (session) {
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

    const shouldHide = pathname.includes('/login') || pathname === '/sign-up' 
                    || pathname === '/forgot-password' 
                    || pathname === '/new-password'
                    || pathname === '/verify-email'
                    || pathname.includes('/auth');
    return (                                                                 
        <div 
            ref={navRef}
            className={`
                ${className}
                ${windowWidth < 768 ? "hidden" : "flex"}
                nav-rail
                relative flex-col
                bg-[--md-sys-color-surface-container-low] rounded-2xl
                overflow-y-auto overflow-x-hidden
                transition-all duration-200 ease-in-out
                ${extended ? 
                    'min-w-[280px] max-w-[600px] w-[20vw]' : 
                    'w-[80px] min-w-[80px] max-w-[80px]'
                }
                
                ${shouldHide ? 'hidden' : ''}
            `}
        >
            <div 
                className="absolute right-[-4px] top-0 bottom-0 w-2 cursor-ew-resize bg-transparent hover:bg-[--md-sys-color-outline-variant] active:bg-[--md-sys-color-outline] active:w-2 active:right-[-1px] transition-all duration-150 z-10"
                onMouseDown={startResizing}
            />
            <div className={`h-full ${extended ? 'p-4' : 'p-3'}`}>
                <button 
                    className="w-full rounded-full text-[--md-sys-color-on-surface] hover:bg-[--md-sys-color-surface-container]"
                    role="button" 
                    onClick={() => { 
                        localStorage.setItem('nav-rail-extended', JSON.stringify(!extended));
                        setExtended(!extended);
                    }}
                >
                    <div className={`rounded-full flex gap-4 relative ${extended ? 'py-4 pl-4 pr-6' : 'p-4'}`}>
                        <span className="material-symbols-outlined w-6 block">menu</span>
                        <span className={`
                            transition-all duration-300 ease-in-out
                            ${extended ? 
                                'opacity-100 w-auto whitespace-nowrap pointer-events-auto translate-x-0' : 
                                'opacity-0 w-0 whitespace-nowrap pointer-events-none -translate-x-5'
                            }
                        `}>
                            Menu
                        </span>
                    </div>
                </button>
                <div className="flex-col mb-4">
                    {
                        pathname.includes('/admin') ?
                        Object.keys(adminItems).map((key) => {
                            const item = adminItems[key];
                            return <NavRailCommonItem
                                key={key}
                                icon={item.icon}
                                text={item.text}
                                showBadge={item.badgevalue > 0}
                                badgevalue={item.badgevalue}
                                selected={pathname === item.href}
                                href={item.href}
                                extended={extended}
                            />
                        })
                        : pathname.includes('/manager') ?
                        Object.keys(managerItems).map((key) => {
                            const item = managerItems[key];
                            return <NavRailCommonItem
                                key={key}
                                icon={key}
                                text={item.text}
                                showBadge={item.badgevalue > 0}
                                badgevalue={item.badgevalue}
                                selected={pathname === item.href}
                                href={item.href}
                                extended={extended}
                            />
                        })
                        : Object.keys(navigationItems).map((key) => {
                            const item = navigationItems[key];
                            const imgSrc = item.img?.src || "/favicon.ico";
                            if (item.type === 0)
                                return <NavRailCommonItem
                                    key={key}
                                    icon={key}
                                    text={item.text}
                                    showBadge={item.badgevalue > 0}
                                    badgevalue={item.badgevalue}
                                    selected={pathname === item.href}
                                    href={item.href}
                                    extended={extended}
                                />
                            else if (item.type === 1)
                                return <NavRailPinnedItem
                                    key={key}
                                    imgSrc={imgSrc}
                                    text={item.text}
                                    width={item.img.width}
                                    selected={pathname === item.href}
                                    href={item.href}
                                    extended={extended}
                                />
                        })
                    }
                </div>
                
                {showPinnedSection && !pathname.includes('/manager') && !pathname.includes('/admin') && (
                    <>
                        <div className="px-4">
                            <hr className="border-[--md-sys-color-outline-variant]"/>
                        </div>
                        <div className={`flex-col ${extended ? "gap-0" : "gap-2"} h-fit flex`}>
                            {
                                (hasCookie('session')) ? 
                                Object.keys(pinnedItems).map((key) => {
                                    const pinned = pinnedItems[key];
                                    const imgSrc = pinned.img?.src || "/favicon.ico";

                                    return <NavRailPinnedItem
                                        key={key}
                                        imgSrc={imgSrc}
                                        text={pinned.text}
                                        width={pinned.img.width}
                                        href={pinned.href}
                                        extended={extended}
                                        selected={pathname === pinned.href}
                                    />
                                })
                                : null
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