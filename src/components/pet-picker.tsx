"use client";

import { useEffect, useRef, useState } from "react";
import { searchPets } from "@/app/(panel)/pets/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PetOption {
  id: string;
  name: string;
  species: string;
  chip_number: string | null;
  owners: { first_name: string; last_name: string | null } | null;
}

interface PetPickerProps {
  initialPet?: PetOption | null;
  disabled?: boolean;
  fieldName?: string;
  /** Called with the full pet (including species) whenever the selection changes. */
  onSelect?: (pet: PetOption | null) => void;
}

export function PetPicker({
  initialPet,
  disabled,
  fieldName = "pet_id",
  onSelect,
}: PetPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PetOption[]>([]);
  const [selected, setSelectedState] = useState<PetOption | null>(
    initialPet ?? null,
  );
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const setSelected = (pet: PetOption | null) => {
    setSelectedState(pet);
    onSelect?.(pet);
  };

  useEffect(() => {
    if (query.trim().length < 2) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchPets(query).then((data) => {
        setResults(data as PetOption[]);
        setOpen(true);
      });
    }, 300);
  }, [query]);

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="pet_search">Mascota</Label>
      {selected ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span>
            {selected.name}
            {selected.owners
              ? ` · ${selected.owners.first_name} ${selected.owners.last_name ?? ""}`
              : ""}
            {selected.chip_number ? ` · chip ${selected.chip_number}` : ""}
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
            id="pet_search"
            placeholder="Busca por nombre o N° de chip..."
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
              {results.map((pet) => (
                <li key={pet.id}>
                  <button
                    type="button"
                    className="hover:bg-accent w-full px-3 py-2 text-left text-sm"
                    onClick={() => {
                      setSelected(pet);
                      setOpen(false);
                    }}
                  >
                    {pet.name}
                    {pet.owners
                      ? ` · ${pet.owners.first_name} ${pet.owners.last_name ?? ""}`
                      : ""}
                    {pet.chip_number ? ` · chip ${pet.chip_number}` : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <input type="hidden" name={fieldName} value={selected?.id ?? ""} />
    </div>
  );
}
