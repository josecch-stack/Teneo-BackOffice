"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface TabLinksProps {
  /** Query param this tab bar reads/writes. */
  param: string;
  options: { value: string; label: string }[];
  /** First option's value is the implicit default when omitted from the URL. */
}

export function TabLinks({ param, options }: TabLinksProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(param) ?? options[0]!.value;

  return (
    <div className="border-border flex gap-1 overflow-x-auto border-b">
      {options.map((o) => {
        const params = new URLSearchParams(searchParams.toString());
        if (o.value === options[0]!.value) params.delete(param);
        else params.set(param, o.value);
        params.set("page", "1");
        return (
          <Link
            key={o.value}
            href={`${pathname}?${params.toString()}`}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium whitespace-nowrap",
              current === o.value
                ? "border-primary text-primary"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
