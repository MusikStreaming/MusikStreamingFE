import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yêu thích",
  description: "New music streaming app, using Material Design",
};

export default function FavoritesLayout({
    children,
    }: Readonly<{
    children: React.ReactNode;
} >) {
  return (
    <>
    {children}
    </>
  );
}