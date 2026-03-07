export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout purposefully does NOT include the Sidebar
  // to keep the user portal isolated from the admin interface.
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
