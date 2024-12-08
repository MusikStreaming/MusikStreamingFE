'use client';

import './nav-rail.css';
import '@material/material-color-utilities';
import Link from 'next/link';

/**
 * @fileoverview Navigation rail item component for use in navigation interfaces.
 * This component implements Material Design 3 navigation rail item specifications.
 * 
 * @cssClasses
 * - nav-item: Base styles for the navigation item
 * - state-layer: Handles interaction states and ripple effects
 * - extended-gap-[true/false]: Controls spacing in extended/collapsed states
 * - selected-[true/false]: Styles for selected state
 * - badge-show-[true/false]: Controls badge visibility
 * 
 * @accessibility
 * The component uses appropriate ARIA roles and is keyboard navigable.
 * Role='link' is applied to maintain semantic structure.
 * 
 * @implementation
 * Uses Material Design ripple effect for interactions
 * Supports both SSR and CSR through Next.js Link component
 * Automatically handles undefined props with sensible defaults
 * 
 * @example
 * // Basic usage
 * <NavRailCommonItem 
 *   icon="home"
 *   text="Home"
 *   href="/home"
 * />
 * 
 * @example
 * // Extended with badge
 * <NavRailCommonItem 
 *   icon="notifications"
 *   text="Notifications"
 *   extended={true}
 *   showBadge={true}
 *   badgevalue={5}
 *   onClick={() => handleNotifications()}
 * />
 */

/**
 * A navigation rail item component that can be displayed in either collapsed or extended state.
 * Supports icons, text labels, badges, and click handling.
 * 
 * The component adapts its layout based on the extended prop:
 * - When collapsed: Shows only icon with optional badge
 * - When extended: Shows icon, label, and optional badge in a row
 * 
 * @typedef {Object} NavRailCommonItemProps
 * @property {string} icon - Material symbol icon name to display
 * @property {string} text - Text label for the navigation item
 * @property {boolean} [extended=false] - Whether the item is in extended (wide) mode
 * @property {boolean} [selected=false] - Whether the item is currently selected
 * @property {boolean} [showBadge=false] - Whether to show the badge
 * @property {number} [badgevalue=0] - The numeric value to show in the badge
 * @property {string} [href='#'] - URL to navigate to when clicked
 * 
 * @param {NavRailCommonItemProps} props - The component props
 * @returns {JSX.Element} A navigation rail item component
 */
export default function NavRailCommonItem(
    props
) {
    if (props.extended === undefined) {
        props.extended = false;
    }
    if (props.selected === undefined) {
        props.selected = false;
    }
    if (props.showBadge === undefined) {
        props.showBadge = false;
    }
    if (props.badgevalue === undefined) {
        props.badgevalue = 0;
    }
    // if (props.onClick === undefined) {
    //     props.onClick = () => {
    //         console.log('No onClick handler defined');
    //     }
    // }
    if (props.href === undefined) {
        props.href = '#';
    }
    return (
        <div className={`nav-item w-full rounded-full cursor-pointer font-medium selected-${props.selected} transition-all duration-300 ease-in-out`} role='link'>
            <Link className={`state-layer w-full relative flex extended-gap-${props.extended} items-center justify-between rounded-full padding-${props.extended ? "extended" : "collapsed"} transition-all duration-300 ease-in-out`} href={props.href}>
                <md-ripple></md-ripple>
                <div className={`nav-item-content flex  w-full extended-gap-${props.extended} items-center`}>
                    <div className="icon flex items-center text-[--md-sys-color-on-surface]">
                        <span className='material-symbols-outlined'>{props.icon}</span>
                    </div>
                    <div className={`label-container flex items-center extended-${props.extended}`}>
                        <span className={`label text-center extended-${props.extended} text-[--md-sys-color-on-surface]`}>{props.text}</span>
                    </div>
                </div>
                <div className={`badge badge-show-${props.showBadge} extended-${props.extended} rounded-full text-center flex items-center justify-center`}>
                    <span>{props.badgevalue}</span>
                </div>
            </Link>
        </div>
    );
}