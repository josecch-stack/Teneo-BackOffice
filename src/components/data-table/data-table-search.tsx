"use client";

import { useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DataTableSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
      <Input
        defaultValue={searchParams.get("q") ?? ""}
        placeholder={placeholder}
        className="pl-8"
        onChange={(e) => {
          const value = e.target.value;
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => handleChange(value), 350);
        }}
      />
    </div>
  );
}
