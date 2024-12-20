import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "MusikStreaming | Library",
    description: "Access your music library on MusikStreaming, using Material Design",
};

export default function LibraryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense>
            <div>{children}</div>
        </Suspense>
    )
}
