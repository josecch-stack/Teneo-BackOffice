"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PetPicker } from "@/components/pet-picker";
import {
  CLINICAL_EVENT_TYPE_OPTIONS,
  type MedicationFormValues,
} from "@/lib/validations/clinical-note";
import type { ClinicalNoteFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MedicationRow extends MedicationFormValues {
  key: string;
}

interface ClinicalNoteFormProps {
  action: (
    state: ClinicalNoteFormState,
    formData: FormData,
  ) => Promise<ClinicalNoteFormState>;
  note?: {
    event_type: string | null;
    event_date: string;
    reason: string | null;
    veterinarian: string | null;
    clinic: string | null;
    notes_diagnosis: string;
    has_prescription: boolean | null;
    pets: {
      id: string;
      name: string;
      species: string;
      chip_number: string | null;
      owners: { first_name: string; last_name: string | null } | null;
    } | null;
    prescription: {
      general_instructions: string | null;
      prescription_date: string | null;
      next_checkup_date: string | null;
      medications: {
        name: string;
        dosage: string | null;
        frequency_hours: number | null;
        duration_days: number | null;
        start_datetime: string | null;
        end_datetime: string | null;
      }[];
    } | null;
  };
  submitLabel: string;
}

const initialState: ClinicalNoteFormState = {};

function emptyMedication(): MedicationRow {
  return {
    key: crypto.randomUUID(),
    name: "",
    dosage: "",
    frequency_hours: undefined,
    duration_days: undefined,
    start_datetime: "",
  };
}

export function ClinicalNoteForm({
  action,
  note,
  submitLabel,
}: ClinicalNoteFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [eventType, setEventType] = useState(note?.event_type ?? "consulta");
  const [hasPrescription, setHasPrescription] = useState(
    note?.has_prescription ?? false,
  );
  const [medications, setMedications] = useState<MedicationRow[]>(
    note?.prescription?.medications.length
      ? note.prescription.medications.map((m) => ({
          key: crypto.randomUUID(),
          name: m.name,
          dosage: m.dosage ?? "",
          frequency_hours: m.frequency_hours ?? undefined,
          duration_days: m.duration_days ?? undefined,
          start_datetime: m.start_datetime ? m.start_datetime.slice(0, 16) : "",
        }))
      : [],
  );

  useEffect(() => {
    if (state.success) toast.success("Nota clínica guardada.");
    if (state.error) toast.error(state.error);
  }, [state]);

  function updateMedication(key: string, patch: Partial<MedicationRow>) {
    setMedications((rows) =>
      rows.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <PetPicker initialPet={note?.pets} disabled={pending} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="event_type">Tipo de evento</Label>
          <Select
            name="event_type"
            value={eventType}
            onValueChange={(v) => setEventType(v ?? "consulta")}
            disabled={pending}
          >
            <SelectTrigger id="event_type">
              <SelectValue>
                {(value: string) =>
                  CLINICAL_EVENT_TYPE_OPTIONS.find((o) => o.value === value)
                    ?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CLINICAL_EVENT_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="event_date">Fecha</Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={note?.event_date ?? ""}
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reason">Motivo</Label>
        <Input
          id="reason"
          name="reason"
          defaultValue={note?.reason ?? ""}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="veterinarian">Veterinario</Label>
          <Input
            id="veterinarian"
            name="veterinarian"
            defaultValue={note?.veterinarian ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="clinic">Clínica</Label>
          <Input
            id="clinic"
            name="clinic"
            defaultValue={note?.clinic ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes_diagnosis">Diagnóstico / notas</Label>
        <Textarea
          id="notes_diagnosis"
          name="notes_diagnosis"
          defaultValue={note?.notes_diagnosis ?? ""}
          required
          disabled={pending}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="has_prescription"
          name="has_prescription"
          checked={hasPrescription}
          onCheckedChange={setHasPrescription}
          disabled={pending}
        />
        <Label htmlFor="has_prescription" className="font-normal">
          Incluye receta
        </Label>
      </div>

      {hasPrescription && (
        <div className="border-border flex flex-col gap-4 rounded-md border p-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="general_instructions">
              Instrucciones generales
            </Label>
            <Textarea
              id="general_instructions"
              name="general_instructions"
              defaultValue={note?.prescription?.general_instructions ?? ""}
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="prescription_date">Fecha de receta</Label>
              <Input
                id="prescription_date"
                name="prescription_date"
                type="date"
                defaultValue={note?.prescription?.prescription_date ?? ""}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="next_checkup_date">Próximo control</Label>
              <Input
                id="next_checkup_date"
                name="next_checkup_date"
                type="date"
                defaultValue={note?.prescription?.next_checkup_date ?? ""}
                disabled={pending}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Label>Medicamentos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  setMedications((rows) => [...rows, emptyMedication()])
                }
              >
                <Plus className="size-4" />
                Agregar medicamento
              </Button>
            </div>

            {medications.map((med) => (
              <div
                key={med.key}
                className="border-border grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_auto] items-end gap-2 rounded-md border p-3"
              >
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Nombre</Label>
                  <Input
                    value={med.name}
                    onChange={(e) =>
                      updateMedication(med.key, { name: e.target.value })
                    }
                    disabled={pending}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Dosis</Label>
                  <Input
                    value={med.dosage ?? ""}
                    onChange={(e) =>
                      updateMedication(med.key, { dosage: e.target.value })
                    }
                    disabled={pending}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Cada (horas)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={med.frequency_hours ?? ""}
                    onChange={(e) =>
                      updateMedication(med.key, {
                        frequency_hours: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    disabled={pending}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Días</Label>
                  <Input
                    type="number"
                    min={1}
                    value={med.duration_days ?? ""}
                    onChange={(e) =>
                      updateMedication(med.key, {
                        duration_days: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    disabled={pending}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Inicio</Label>
                  <Input
                    type="datetime-local"
                    value={med.start_datetime ?? ""}
                    onChange={(e) =>
                      updateMedication(med.key, {
                        start_datetime: e.target.value,
                      })
                    }
                    disabled={pending}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() =>
                    setMedications((rows) =>
                      rows.filter((r) => r.key !== med.key),
                    )
                  }
                  aria-label="Quitar medicamento"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            <p className="text-muted-foreground text-xs">
              El fin de tratamiento se calcula automáticamente a partir del
              inicio y la duración.
            </p>
          </div>
        </div>
      )}

      <input
        type="hidden"
        name="medications_json"
        value={JSON.stringify(
          medications
            .filter((m) => m.name.trim())
            .map((m) => ({
              name: m.name,
              dosage: m.dosage,
              frequency_hours: m.frequency_hours,
              duration_days: m.duration_days,
              start_datetime: m.start_datetime,
            })),
        )}
      />

      {state.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <Button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full px-6"
        >
          {pending ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
