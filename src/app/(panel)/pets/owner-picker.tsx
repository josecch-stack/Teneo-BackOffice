"use client";

import { useEffect, useRef, useState } from "react";
import { searchOwners } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OwnerOption {
  user_id: string;
  first_name: string;
  last_name: string | null;
  rut: string | null;
  email: string | null;
}

interface OwnerPickerProps {
  initialOwner?: OwnerOption | null;
  disabled?: boolean;
}

export function OwnerPicker({ initialOwner, disabled }: OwnerPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OwnerOption[]>([]);
  const [selected, setSelected] = useState<OwnerOption | null>(
    initialOwner ?? null,
  );
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (query.trim().length < 2) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchOwners(query).then((data) => {
        setResults(data);
        setOpen(true);
      });
    }, 300);
  }, [query]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="owner_search">Tutor</Label>
      {selected ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span>
            {selected.first_name} {selected.last_name ?? ""}
            {selected.rut ? ` · ${selected.rut}` : ""}
          </span>
          {!disabled && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={() => {
                setSelected(null);
                setQuery("");
              }}
            >
              Cambiar
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Input
            id="owner_search"
            placeholder="Busca por nombre, RUT o correo..."
            value={query}
            disabled={disabled}
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
          {open && results.length > 0 && (
            <ul className="bg-popover absolute z-10 mt-1 w-full rounded-md border shadow-md">
              {results.map((owner) => (
                <li key={owner.user_id}>
                  <button
                    type="button"
                    className="hover:bg-accent w-full px-3 py-2 text-left text-sm"
                    onClick={() => {
                      setSelected(owner);
                      setOpen(false);
                    }}
                  >
                    {owner.first_name} {owner.last_name ?? ""}
                    {owner.rut ? ` · ${owner.rut}` : ""}
                    {owner.email ? ` · ${owner.email}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <input type="hidden" name="owner_id" value={selected?.user_id ?? ""} />
    </div>
  );
}
