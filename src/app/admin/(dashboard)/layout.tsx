import { AdminSidebar } from "@/components/organisms/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-[#fdfaf9]">
      <AdminSidebar />
      <div className="flex-1 px-10 py-8">{children}</div>
    </div>
  );
}
