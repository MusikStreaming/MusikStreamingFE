'use client';
import 'material-symbols';
import '@material/web/ripple/ripple';
import NavRailCommonItem from './nav-rail-common-item';
import NavRailPinnedItem from './nav-rail-pinned-item';
import { useState } from 'react';
import { NavItemData } from '../model/nav-item-data';
import "./nav-rail.css";

export default function NavRail(
    props: {
        className?: string,
        items: {
            [key: string]: NavItemData
        },
        pinned?: {
            [key: string]: NavItemData
        },
        selected: number
    }
) {
    let sum_ = Array.from(Object.keys(props.items)).length + (props.pinned === undefined ? 0 : Array.from(Object.keys(props.pinned!)).length);
    const [selected, setSelected] = useState(0);
    const [extended, setExtended] = useState(true);
    return (
        <div className={`${props.className} nav-rail relative flex-col bg-[--md-sys-color-surface-container-low] overflow-clip rounded-2xl nav-rail-${extended ? 'extended' : 'collapsed'}`}>
            <div className={`nav-rail-inner h-full overflow-y-scroll nav-rail--padding-${extended?'extended':'collapsed'}`}>
                <div className={`button selected-false rounded-full`} role="button" onClick={() => {
                    setExtended(!extended);
                }}>
                    <div className={`state-layer rounded-full flex gap-4 relative padding-${extended ? "extended" : "collapsed "}`}>
                        <md-ripple/>
                        <span className="material-symbols-outlined">menu</span>
                        <p>{extended ? "Menu" : ""}</p>
                    </div>
                </div>
                <div className="nav-rail-common flex-col">
                    {
                        Object.keys(props.items).map((key: string, index: number) => {
                            if (props.items[key]['type'] === 1 && props.items[key]['img']!['src'] === undefined) {
                                props.items[key]['img']!['src'] = "/favicon.ico";
                            }
                            if (props.items[key]['type'] === 0)
                                return <NavRailCommonItem
                                    key={key}
                                    icon={key}
                                    text={props.items[key]['text']}
                                    showBadge={props.items[key]['badgevalue']! > 0}
                                    badgevalue={props.items[key]['badgevalue']!}
                                    selected={selected === index}
                                    href={props.items[key]['href']}
                                    onClick={() => { setSelected(index) }}
                                    extended={extended}
                                />
                            else if (props.items[key]['type'] === 1)
                                return <NavRailPinnedItem
                                    key={key}
                                    imgSrc={props.items[key]['img']!['src']}
                                    text={props.items[key]['text']}
                                    width={props.items[key]['img']!['width']}
                                    selected={selected === index}
                                    href={props.items[key]['href']}
                                    onClick={() => { setSelected(index) }}
                                    extended={extended}
                                />
                            else
                                return <NavRailCommonItem
                                    key={key}
                                    icon={key}
                                    text={props.items[key]['text']}
                                    showBadge={props.items[key]['badgevalue']! > 0}
                                    badgevalue={props.items[key]['badgevalue']!}
                                    selected={selected === index}
                                    href={props.items[key]['href']}
                                    onClick={() => { setSelected(index) }}
                                    extended={extended}
                                />
                        })
                    }
                </div>
                <hr />
                <div className="nav-rail-pinned flex-col">
                    {
                        props.pinned !== undefined
                        ? Object.keys(props.pinned).map((key: string, index: number) => {
                            if (props.pinned![key]['img']!['src'] === undefined) {
                                props.pinned![key]['img']!['src'] = "/favicon.ico";
                            }
                            return <NavRailPinnedItem
                                key={key}
                                imgSrc={props.pinned![key]['img']!['src']}
                                text={props.pinned![key]['text']}
                                width={props.pinned![key]['img']!['width']}
                                selected={selected === sum_ - 1 - index}
                                href={props.pinned![key]['href']}
                                onClick={() => { setSelected(index) }}
                                extended={extended}
                            />
                        })
                        : <></>
                    }
                </div>
            </div>
        </div>
    );
}