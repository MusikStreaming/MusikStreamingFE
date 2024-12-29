import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin layout for the dashboard",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {children}
    </div>
  );
}
