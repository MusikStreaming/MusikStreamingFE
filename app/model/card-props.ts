import { ImageProps } from "./image-props";

export type CardProps = {
    title: string;
    subtitle: string;
    subHref?: string;
    img: ImageProps;
    href: string;
    onClick?: () => void;
    isMultipleItemSub?: boolean;
    subHrefItems?: string[];
    subItems?: string[];
    songID?: string;
}