import { ChevronDown, LogOut } from "lucide-react";
import { logout } from "@/lib/auth/actions";
import type { PanelRole } from "@/lib/auth/dal";
import { ROLE_LABELS } from "@/lib/validations/panel-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ email, role }: { email: string; role: PanelRole }) {
  const initials = email.slice(0, 2).toUpperCase();
  // TODO: use panel_users.full_name once it's threaded into the JWT claims.
  const displayName = email.split("@")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-md p-2 text-left outline-none focus-visible:ring-2">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-1 truncate text-sm font-bold">
            {displayName}
            <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
          </span>
          <span className="text-muted-foreground truncate text-sm">
            {ROLE_LABELS[role]}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{email}</span>
          <span className="text-muted-foreground text-xs">
            {ROLE_LABELS[role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logout}>
          <button
            type="submit"
            className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
