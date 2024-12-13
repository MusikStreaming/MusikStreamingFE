'use client';

import BottomNavBarItem from './bottom-nav-bar-item';
import { BottomNavItemData } from '@/app/model/bottom-nav-item-data';
import { usePathname } from 'next/navigation';
// import './bottom-nav-bar.css';

/**
 * A responsive bottom navigation bar component that displays on mobile devices.
 * Renders a list of navigation items with icons and text.
 * Hides automatically on medium and larger screen sizes.
 * 
 * @component
 * @param {Object} props - The component props
 * @param {string} [props.className] - Additional CSS classes to apply to the container
 * @param {Object.<string, NavItemData>} props.items - Navigation items where the key is the icon name
 *        and the value contains the text and href for the item
 * @returns {JSX.Element} A responsive bottom navigation bar
 */

const items: { [key: string]: BottomNavItemData } = {
  'home': {
    text: 'Trang chủ',
    icon: 'home',
    href: '/',
  },

  'explore': {
    text: 'Khám phá',
    icon: 'search',
    href: '/search',
  },
  'library_music': {
    text: 'Thư viện',
    icon: 'library_music',
    href: '/library',
  },
  'settings': {
    text: 'Cài đặt',
    icon: 'settings',
    href: '/settings',
  },
};

const managerItems : {[key: string]: BottomNavItemData} = {
  'dashboard': {
    text: 'Dashboard',
    icon: 'dashboard',
    href: '/manager',
  },
  'album': {
    text: 'Discography',
    icon: 'discography',
    href: '/manager/discography',
  },
  'settings':{
    text: 'Settings',
    icon: 'settings',
    href: '/manager/settings',
  }
}

export default function BottomNavBar(
  props: {
    className?: string,
  }
) {
  const pathname = usePathname();
  return (
    // Container with responsive hiding on md breakpoint
    <nav className={`${props.className} bottom-nav-bar bg-[--md-sys-color-surface] block p-3 z-50 md:hidden text-sm`}>
      <div className="flex items-center justify-around w-full">
        {/* Map through items object to render navigation items */}
        {
          !pathname.includes('/manager') ?
            Object.keys(items).map((key: string, index: number) => {
              return (
                <BottomNavBarItem
                  key={`${items[key].text} ${index}`}
                  icon={key}
                  text={items[key]['text']}
                  href={items[key]['href']}
                />
              );
            })
            : Object.keys(managerItems).map((key: string, index: number) => {
              return (
                <BottomNavBarItem
                  key={`${managerItems[key].text} ${index}`}
                  icon={key}
                  text={managerItems[key]['text']}
                  href={managerItems[key]['href']}
                />
              );
            })
        }
      </div>
    </nav>
  );
}