'use client'
import '@material/web/ripple/ripple';
import Image from 'next/image';

/**
 * OutlinedButton component renders a button with optional icon and leading image.
 * 
 * @param {Object} props - The properties object.
 * @param {string} [props.className] - Additional class names for the button.
 * @param {string} [props.type] - Button type.
 * @param {function} props.onClick - Click event handler for the button.
 * @param {string} [props.icon] - Icon name to be displayed.
 * @param {boolean} [props.showIcon] - Flag to show or hide the icon.
 * @param {Object} [props.leadingImg] - Leading image properties.
 * @param {string} props.leadingImg.src - Source URL of the leading image.
 * @param {string} props.leadingImg.alt - Alt text for the leading image.
 * @param {boolean} [props.showLeadingImg] - Flag to show or hide the leading image.
 * @param {string} [props.children] - Button text.
 * 
 * @returns {JSX.Element} The rendered button component.
 */
export default function OutlinedButton(props) {
    let showIcon = props.showIcon;
    if (props.icon === undefined || props.icon === '') {
        showIcon = false;
    }
    else if (props.showIcon === undefined) {
        showIcon = false;
    }
    return(
        <button className={`text-btn flex border-2 rounded-full border-[--md-sys-color-outline] items-center justify-stretch focus:ring ${props.className}`} role='button' onClick={props.onClick} type={props.type}>
            <div className={`state-layer p-4 relative ${showIcon?"":"pr-6"} gap-3 rounded-full flex items-center justify-center text-[--md-sys-color-primary] flex-grow`}>
                <md-ripple className="ripple"/>
                {
                    props.showLeadingImg
                    ? <Image
                    src={props.leadingImg.src}
                    alt={props.leadingImg.alt}
                    width={18}
                    height={18}
                    ></Image>
                    : <></>
                }
                <span className={`material-symbols-outlined ${showIcon ? "block" : "none"} block`}>{props.icon}</span>
                <span className='text-center font-medium block'>{props.children}</span>
            </div>
        </button>
    )
}