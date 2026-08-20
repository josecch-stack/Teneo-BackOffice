"use client";

import { useEffect, useState } from "react";
import { formatDateCL } from "@/lib/utils/date";
import { listPetClinicalNotes } from "./actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClinicalNoteOption {
  id: string;
  event_date: string;
  reason: string | null;
}

export function ClinicalNoteSelect({
  petId,
  defaultValue,
  disabled,
}: {
  petId: string | null;
  defaultValue?: string | null;
  disabled?: boolean;
}) {
  const [notes, setNotes] = useState<ClinicalNoteOption[]>([]);
  const [value, setValue] = useState(defaultValue ?? "");

  useEffect(() => {
    listPetClinicalNotes(petId ?? "").then(setNotes);
  }, [petId]);

  const label = (note: ClinicalNoteOption) =>
    `${formatDateCL(note.event_date)}${note.reason ? ` — ${note.reason}` : ""}`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="clinical_note_id">Nota clínica asociada (opcional)</Label>
      <Select
        value={value}
        onValueChange={(v) => setValue(v ?? "")}
        disabled={disabled || !petId || !notes.length}
      >
        <SelectTrigger id="clinical_note_id">
          <SelectValue
            placeholder={
              petId ? "Sin vincular" : "Selecciona una mascota primero"
            }
          >
            {(v: string) => {
              const note = notes.find((n) => n.id === v);
              return note ? label(note) : v;
            }}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {notes.map((note) => (
            <SelectItem key={note.id} value={note.id}>
              {label(note)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name="clinical_note_id" value={value} />
    </div>
  );
}
