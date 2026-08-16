"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-items";

export function SidebarNav({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((group, i) => {
        const items = group.items.filter(
          (item) => !item.permission || permissions.includes(item.permission),
        );
        if (!items.length) return null;

        return (
          <div
            key={group.label ?? `group-${i}`}
            className="flex flex-col gap-2"
          >
            {group.label && (
              <span className="text-muted-foreground px-3 text-xs font-bold tracking-wide uppercase">
                {group.label}
              </span>
            )}
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (!item.implemented) {
                  return (
                    <span
                      key={item.href}
                      aria-disabled="true"
                      title="Próximamente"
                      className="text-muted-foreground/50 flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-sm select-none"
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground/80",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
