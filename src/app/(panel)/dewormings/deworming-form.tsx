"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { PetPicker } from "@/components/pet-picker";
import { DEWORMING_TYPE_OPTIONS } from "@/lib/validations/deworming";
import type { DewormingFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DewormingFormProps {
  action: (
    state: DewormingFormState,
    formData: FormData,
  ) => Promise<DewormingFormState>;
  deworming?: {
    type: string;
    product: string;
    application_date: string;
    next_dose_date: string | null;
    weight_kg: number | null;
    dosage: string | null;
    pets: {
      id: string;
      name: string;
      species: string;
      chip_number: string | null;
      owners: { first_name: string; last_name: string | null } | null;
    } | null;
  };
  submitLabel: string;
}

const initialState: DewormingFormState = {};

export function DewormingForm({
  action,
  deworming,
  submitLabel,
}: DewormingFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [type, setType] = useState(deworming?.type ?? "interna");

  useEffect(() => {
    if (state.success) toast.success("Desparasitación guardada.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <PetPicker initialPet={deworming?.pets} disabled={pending} />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Tipo</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value ?? "interna")}
            disabled={pending}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEWORMING_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="type" value={type} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="product">Producto</Label>
          <Input
            id="product"
            name="product"
            placeholder="ej. Bravecto, Nexgard"
            defaultValue={deworming?.product ?? ""}
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="application_date">Fecha de aplicación</Label>
          <Input
            id="application_date"
            name="application_date"
            type="date"
            defaultValue={deworming?.application_date ?? ""}
            required
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="next_dose_date">Próxima dosis</Label>
          <Input
            id="next_dose_date"
            name="next_dose_date"
            type="date"
            defaultValue={deworming?.next_dose_date ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="weight_kg">Peso al momento de la dosis (kg)</Label>
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            defaultValue={deworming?.weight_kg ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dosage">Dosis</Label>
          <Input
            id="dosage"
            name="dosage"
            placeholder='ej. "1 comprimido", "0.5 ml"'
            defaultValue={deworming?.dosage ?? ""}
            disabled={pending}
          />
        </div>
      </div>

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
