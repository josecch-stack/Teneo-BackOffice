"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, PawPrint } from "lucide-react";
import { globalSearch, type GlobalSearchResult } from "./global-search-actions";
import { Input } from "@/components/ui/input";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (query.trim().length < 2) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      globalSearch(query).then((data) => {
        setResults(data);
        setOpen(true);
      });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function goTo(result: GlobalSearchResult) {
    setOpen(false);
    setQuery("");
    router.push(
      result.type === "owner" ? `/owners/${result.id}` : `/pets/${result.id}`,
    );
  }

  return (
    <div className="relative px-0">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        placeholder="Buscar tutores o mascotas"
        className="border-border bg-card pl-9"
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          if (value.trim().length < 2) {
            setResults([]);
            setOpen(false);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && (
        <div className="bg-popover text-popover-foreground ring-foreground/10 absolute z-50 mt-1 w-full overflow-hidden rounded-lg shadow-md ring-1">
          {results.length === 0 ? (
            <p className="text-muted-foreground px-3 py-2 text-sm">
              Sin resultados.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    type="button"
                    className="hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => goTo(result)}
                  >
                    {result.type === "owner" ? (
                      <Users className="text-muted-foreground size-4 shrink-0" />
                    ) : (
                      <PawPrint className="text-muted-foreground size-4 shrink-0" />
                    )}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">
                        {result.title}
                      </span>
                      {result.subtitle && (
                        <span className="text-muted-foreground truncate text-xs">
                          {result.subtitle}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
