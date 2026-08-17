import Image from "next/image";
import { verifySession } from "@/lib/auth/dal";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const session = await verifySession();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-[280px] shrink-0 flex-col justify-between gap-6 px-4 py-6 md:flex">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <Image
              src="/teneo-logo-blue.png"
              alt="Teneo Pet"
              width={95}
              height={36}
              priority
            />
          </div>
          <GlobalSearch />
          <SidebarNav permissions={session.permissions} />
        </div>
        <div className="border-border flex flex-col gap-4 border-t pt-4">
          <ThemeToggle />
          <UserMenu email={session.email} role={session.role} />
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
