import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MusikStreaming | Settings",
    description: "Manage your settings on MusikStreaming, using Material Design",
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full">{children}</div>
    )
}


