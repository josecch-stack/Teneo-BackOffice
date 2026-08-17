"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./sidebar-content";
import type { PanelRole } from "@/lib/auth/dal";

export function MobileNav({
  email,
  role,
  permissions,
}: {
  email: string;
  role: PanelRole;
  permissions: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-sidebar text-sidebar-foreground border-border flex items-center justify-between border-b px-4 py-3 md:hidden">
      <Image
        src="/teneo-logo-blue.png"
        alt="Teneo Pet"
        width={80}
        height={30}
        priority
      />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
          <Menu className="size-5" />
          <span className="sr-only">Abrir menú</span>
        </SheetTrigger>
        <SheetContent>
          <SidebarContent
            email={email}
            role={role}
            permissions={permissions}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}
