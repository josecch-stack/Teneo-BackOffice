"use client";

import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ExportMenu({
  csvHref,
  xlsxHref,
}: {
  csvHref: string;
  xlsxHref: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="rounded-full" />}>
        <Download className="size-4" />
        Exportar
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<a href={csvHref} />}>
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={xlsxHref} />}>
          Exportar XLSX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
