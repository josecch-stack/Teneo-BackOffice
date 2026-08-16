"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { PetPicker } from "@/components/pet-picker";
import { ClinicalNoteSelect } from "./clinical-note-select";
import { ExamFileList } from "./exam-file-list";
import { IMAGING_TYPE_OPTIONS } from "@/lib/validations/exam";
import type { ExamFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImagingExamFormProps {
  action: (state: ExamFormState, formData: FormData) => Promise<ExamFormState>;
  imagingExam?: {
    clinical_note_id: string | null;
    image_type: string;
    body_region: string | null;
    exam_date: string;
    vet_center: string | null;
    findings: string | null;
    pets: {
      id: string;
      name: string;
      species: string;
      chip_number: string | null;
      owners: { first_name: string; last_name: string | null } | null;
    } | null;
    imaging_exam_files: {
      id: string;
      file_url: string;
      file_name: string | null;
    }[];
  };
  submitLabel: string;
}

const initialState: ExamFormState = {};

export function ImagingExamForm({
  action,
  imagingExam,
  submitLabel,
}: ImagingExamFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [petId, setPetId] = useState<string | null>(
    imagingExam?.pets?.id ?? null,
  );
  const [imageType, setImageType] = useState(imagingExam?.image_type ?? "rx");

  useEffect(() => {
    if (state.success) toast.success("Examen guardado.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <PetPicker
        initialPet={imagingExam?.pets}
        disabled={pending}
        onSelect={(pet) => setPetId(pet?.id ?? null)}
      />

      <ClinicalNoteSelect
        petId={petId}
        defaultValue={imagingExam?.clinical_note_id}
        disabled={pending}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="image_type">Tipo de imagen</Label>
          <Select
            name="image_type"
            value={imageType}
            onValueChange={(v) => setImageType(v ?? "rx")}
            disabled={pending}
          >
            <SelectTrigger id="image_type">
              <SelectValue>
                {(value: string) =>
                  IMAGING_TYPE_OPTIONS.find((o) => o.value === value)?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {IMAGING_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="body_region">Zona del cuerpo</Label>
          <Input
            id="body_region"
            name="body_region"
            defaultValue={imagingExam?.body_region ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exam_date">Fecha del examen</Label>
          <Input
            id="exam_date"
            name="exam_date"
            type="date"
            defaultValue={imagingExam?.exam_date ?? ""}
            required
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="vet_center">Centro veterinario</Label>
          <Input
            id="vet_center"
            name="vet_center"
            defaultValue={imagingExam?.vet_center ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="findings">Hallazgos</Label>
        <Textarea
          id="findings"
          name="findings"
          defaultValue={imagingExam?.findings ?? ""}
          disabled={pending}
        />
      </div>

      {imagingExam && imagingExam.imaging_exam_files.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Archivos adjuntos</Label>
          <ExamFileList files={imagingExam.imaging_exam_files} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="files">
          {imagingExam ? "Adjuntar archivos nuevos" : "Adjuntar archivos"}
        </Label>
        <input
          id="files"
          name="files"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={pending}
          className="file:bg-secondary text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm file:font-medium"
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
