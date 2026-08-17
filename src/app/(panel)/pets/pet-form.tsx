"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { OwnerPicker } from "./owner-picker";
import {
  SPECIES_OPTIONS,
  SEX_OPTIONS,
  SPECIES_LABELS,
  SEX_LABELS,
} from "@/lib/validations/pet";
import type { PetFormState } from "./actions";
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

interface PetFormProps {
  action: (state: PetFormState, formData: FormData) => Promise<PetFormState>;
  pet?: {
    name: string;
    species: string;
    custom_species: string | null;
    breed: string | null;
    birth_date: string;
    sex: string | null;
    color: string | null;
    weight_kg: number | null;
    is_sterilized: boolean | null;
    health_notes: string | null;
    chip_number: string | null;
    vet_name: string | null;
    vet_phone: string | null;
    owners: {
      user_id: string;
      first_name: string;
      last_name: string | null;
      rut: string | null;
      email: string | null;
    } | null;
  };
  submitLabel: string;
}

const initialState: PetFormState = {};

export function PetForm({ action, pet, submitLabel }: PetFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [species, setSpecies] = useState(pet?.species ?? "perro");

  useEffect(() => {
    if (state.success) toast.success("Mascota guardada.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <OwnerPicker initialOwner={pet?.owners} disabled={pending} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={pet?.name ?? ""}
          required
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="species">Especie</Label>
          <Select
            name="species"
            value={species}
            onValueChange={(v) => setSpecies(v ?? "perro")}
            disabled={pending}
          >
            <SelectTrigger id="species">
              <SelectValue>
                {(value: string) => SPECIES_LABELS[value]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SPECIES_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {species === "otro" && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="custom_species">¿Cuál especie?</Label>
            <Input
              id="custom_species"
              name="custom_species"
              defaultValue={pet?.custom_species ?? ""}
              disabled={pending}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="breed">Raza</Label>
          <Input
            id="breed"
            name="breed"
            defaultValue={pet?.breed ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="birth_date">Fecha de nacimiento</Label>
          <Input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={pet?.birth_date ?? ""}
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sex">Sexo</Label>
          <Select
            name="sex"
            defaultValue={pet?.sex ?? undefined}
            disabled={pending}
          >
            <SelectTrigger id="sex">
              <SelectValue placeholder="Selecciona">
                {(value: string) => SEX_LABELS[value] ?? "Selecciona"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SEX_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            name="color"
            defaultValue={pet?.color ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="weight_kg">Peso (kg)</Label>
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            step="0.1"
            defaultValue={pet?.weight_kg ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="is_sterilized"
          name="is_sterilized"
          defaultChecked={pet?.is_sterilized ?? false}
          disabled={pending}
        />
        <Label htmlFor="is_sterilized" className="font-normal">
          Esterilizado
        </Label>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="chip_number">N° de chip</Label>
        <Input
          id="chip_number"
          name="chip_number"
          placeholder="10 a 15 dígitos"
          defaultValue={pet?.chip_number ?? ""}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vet_name">Veterinario de cabecera</Label>
          <Input
            id="vet_name"
            name="vet_name"
            defaultValue={pet?.vet_name ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vet_phone">Teléfono veterinario</Label>
          <Input
            id="vet_phone"
            name="vet_phone"
            placeholder="+56912345678"
            defaultValue={pet?.vet_phone ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="health_notes">Notas de salud</Label>
        <Textarea
          id="health_notes"
          name="health_notes"
          defaultValue={pet?.health_notes ?? ""}
          disabled={pending}
        />
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
