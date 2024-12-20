import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MusikStreaming | Manager Settings",
    description: "Manage your settings on MusikStreaming, using Material Design",
};

export default function ManagerSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>{children}</div>
    )
}


