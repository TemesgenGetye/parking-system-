import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AdminAuthGuard from "@/components/auth/AdminAuthGuard";

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#F8F9FB]">
        <Sidebar />
        <div className="min-h-screen pt-16 lg:pt-0 lg:pl-[304px]">
          <Header />
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
