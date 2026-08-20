import Image from "next/image";
import { SidebarNav } from "./sidebar-nav";
import { UserMenu } from "./user-menu";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PanelRole } from "@/lib/auth/dal";

/** Shared between the always-visible desktop <aside> and the mobile Sheet. */
export function SidebarContent({
  email,
  role,
  permissions,
  onNavigate,
}: {
  email: string;
  role: PanelRole;
  permissions: string[];
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
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
        <SidebarNav permissions={permissions} onNavigate={onNavigate} />
      </div>
      <div className="border-border flex shrink-0 flex-col gap-4 border-t pt-4">
        <ThemeToggle />
        <UserMenu email={email} role={role} />
      </div>
    </>
  );
}
