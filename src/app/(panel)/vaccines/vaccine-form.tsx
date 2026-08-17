"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { PetPicker } from "@/components/pet-picker";
import { listVaccineCatalog, listLabCatalog } from "./actions";
import {
  calculateNextVaccineDose,
  type Species,
  type VaccineApplicationType,
} from "@/lib/utils/vaccine-dose";
import type { VaccineFormState } from "./actions";
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

interface CatalogOption {
  id: number;
  name: string;
}

interface VaccineFormProps {
  action: (
    state: VaccineFormState,
    formData: FormData,
  ) => Promise<VaccineFormState>;
  vaccine?: {
    application_type: string | null;
    vaccine_name: string;
    application_date: string | null;
    next_dose_date: string | null;
    brand_lab: string | null;
    batch_code: string | null;
    vet_center: string | null;
    vet_name: string | null;
    vaccine_catalog_id: number | null;
    lab_catalog_id: number | null;
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

const initialState: VaccineFormState = {};
const AUTO_CALC_SPECIES = new Set(["perro", "gato"]);

export function VaccineForm({
  action,
  vaccine,
  submitLabel,
}: VaccineFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const [petSpecies, setPetSpecies] = useState<Species | null>(
    (vaccine?.pets?.species as Species) ?? null,
  );
  const [vaccineCatalogId, setVaccineCatalogId] = useState(
    vaccine?.vaccine_catalog_id?.toString() ?? "",
  );
  const [vaccineName, setVaccineName] = useState(vaccine?.vaccine_name ?? "");
  const [applicationType, setApplicationType] = useState(
    vaccine?.application_type ?? "refuerzo",
  );
  const [applicationDate, setApplicationDate] = useState(
    vaccine?.application_date ?? "",
  );
  const [nextDoseDate, setNextDoseDate] = useState(
    vaccine?.next_dose_date ?? "",
  );
  const [labCatalogId, setLabCatalogId] = useState(
    vaccine?.lab_catalog_id?.toString() ?? "",
  );
  const [brandLab, setBrandLab] = useState(vaccine?.brand_lab ?? "");

  const [vaccineCatalog, setVaccineCatalog] = useState<CatalogOption[]>([]);
  const [labCatalog, setLabCatalog] = useState<CatalogOption[]>([]);

  const autoCalculated =
    petSpecies !== null && AUTO_CALC_SPECIES.has(petSpecies);

  // Preview only, derived during render — the DB trigger recomputes this for
  // perro/gato regardless of what's submitted (see
  // docs/schema-discovery.md, calculate_next_vaccine_dose).
  const previewNextDose =
    autoCalculated && applicationDate && applicationType
      ? calculateNextVaccineDose(
          petSpecies!,
          applicationType as VaccineApplicationType,
          new Date(applicationDate),
        )
      : null;
  const displayedNextDoseDate = autoCalculated
    ? (previewNextDose?.toISOString().slice(0, 10) ?? "")
    : nextDoseDate;

  useEffect(() => {
    listVaccineCatalog(petSpecies ?? undefined).then(setVaccineCatalog);
  }, [petSpecies]);

  useEffect(() => {
    listLabCatalog().then(setLabCatalog);
  }, []);

  useEffect(() => {
    if (state.success) toast.success("Vacuna guardada.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <PetPicker
        initialPet={vaccine?.pets}
        disabled={pending}
        onSelect={(pet) => setPetSpecies((pet?.species as Species) ?? null)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vaccine_catalog_id">Vacuna (catálogo)</Label>
          <Select
            value={vaccineCatalogId}
            onValueChange={(value) => {
              setVaccineCatalogId(value ?? "");
              const match = vaccineCatalog.find(
                (c) => c.id.toString() === value,
              );
              if (match) setVaccineName(match.name);
            }}
            disabled={pending}
          >
            <SelectTrigger id="vaccine_catalog_id">
              <SelectValue placeholder="Elige del catálogo (opcional)">
                {(value: string) =>
                  vaccineCatalog.find((c) => c.id.toString() === value)?.name ??
                  "Elige del catálogo (opcional)"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {vaccineCatalog.map((option) => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            name="vaccine_catalog_id"
            value={vaccineCatalogId}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vaccine_name">Nombre de la vacuna</Label>
          <Input
            id="vaccine_name"
            name="vaccine_name"
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            placeholder="Requerido si no eliges del catálogo"
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="application_type">Tipo de aplicación</Label>
        <Select
          value={applicationType}
          onValueChange={(value) => setApplicationType(value ?? "refuerzo")}
          disabled={pending}
        >
          <SelectTrigger id="application_type" className="max-w-xs">
            <SelectValue>
              {(value: string) =>
                value === "refuerzo"
                  ? "Refuerzo"
                  : value === "anual"
                    ? "Anual"
                    : value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="refuerzo">Refuerzo</SelectItem>
            <SelectItem value="anual">Anual</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="application_type" value={applicationType} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="application_date">Fecha de aplicación</Label>
          <Input
            id="application_date"
            name="application_date"
            type="date"
            value={applicationDate}
            onChange={(e) => setApplicationDate(e.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="next_dose_date">
            Próxima dosis{" "}
            {autoCalculated && (
              <span className="text-muted-foreground">(automática)</span>
            )}
          </Label>
          <Input
            id="next_dose_date"
            name="next_dose_date"
            type="date"
            value={displayedNextDoseDate}
            onChange={(e) => setNextDoseDate(e.target.value)}
            disabled={pending || autoCalculated}
            required={petSpecies !== null && !autoCalculated}
            min={!autoCalculated ? applicationDate || undefined : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lab_catalog_id">Marca/Laboratorio</Label>
          <Select
            value={labCatalogId}
            onValueChange={(value) => {
              setLabCatalogId(value ?? "");
              const match = labCatalog.find((c) => c.id.toString() === value);
              if (match) setBrandLab(match.name);
            }}
            disabled={pending}
          >
            <SelectTrigger id="lab_catalog_id">
              <SelectValue placeholder="Elige del catálogo (opcional)">
                {(value: string) =>
                  labCatalog.find((c) => c.id.toString() === value)?.name ??
                  "Elige del catálogo (opcional)"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {labCatalog.map((option) => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="lab_catalog_id" value={labCatalogId} />
          <Input
            name="brand_lab"
            value={brandLab}
            onChange={(e) => setBrandLab(e.target.value)}
            placeholder="O escribe la marca"
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="batch_code">Lote</Label>
          <Input
            id="batch_code"
            name="batch_code"
            defaultValue={vaccine?.batch_code ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vet_center">Centro veterinario</Label>
          <Input
            id="vet_center"
            name="vet_center"
            defaultValue={vaccine?.vet_center ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vet_name">Médico veterinario</Label>
          <Input
            id="vet_name"
            name="vet_name"
            defaultValue={vaccine?.vet_name ?? ""}
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
