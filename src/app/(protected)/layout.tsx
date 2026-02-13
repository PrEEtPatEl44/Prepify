import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar collapsible="icon" />
      <main className="flex-1 min-w-0 p-4">{children}</main>
    </SidebarProvider>
  );
}
