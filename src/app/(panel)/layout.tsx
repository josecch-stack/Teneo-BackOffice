import { verifySession } from "@/lib/auth/dal";
import { SidebarContent } from "./sidebar-content";
import { MobileNav } from "./mobile-nav";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <MobileNav
        email={session.email}
        role={session.role}
        permissions={session.permissions}
      />
      <aside className="bg-sidebar text-sidebar-foreground sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col gap-6 overflow-hidden px-4 py-6 md:flex">
        <SidebarContent
          email={session.email}
          role={session.role}
          permissions={session.permissions}
        />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
