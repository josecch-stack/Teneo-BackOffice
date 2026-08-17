"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { PetPicker } from "@/components/pet-picker";
import { ClinicalNoteSelect } from "./clinical-note-select";
import { ExamFileList } from "./exam-file-list";
import { EXAM_CATEGORY_OPTIONS } from "@/lib/validations/exam";
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

interface LabExamFormProps {
  action: (state: ExamFormState, formData: FormData) => Promise<ExamFormState>;
  labExam?: {
    clinical_note_id: string | null;
    exam_name: string;
    category: string;
    sample_date: string | null;
    result_date: string;
    lab_center: string | null;
    summary: string | null;
    pets: {
      id: string;
      name: string;
      species: string;
      chip_number: string | null;
      owners: { first_name: string; last_name: string | null } | null;
    } | null;
    lab_exam_files: {
      id: string;
      file_url: string;
      file_name: string | null;
    }[];
  };
  submitLabel: string;
}

const initialState: ExamFormState = {};

export function LabExamForm({
  action,
  labExam,
  submitLabel,
}: LabExamFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [petId, setPetId] = useState<string | null>(labExam?.pets?.id ?? null);
  const [category, setCategory] = useState(labExam?.category ?? "otro");

  useEffect(() => {
    if (state.success) toast.success("Examen guardado.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <PetPicker
        initialPet={labExam?.pets}
        disabled={pending}
        onSelect={(pet) => setPetId(pet?.id ?? null)}
      />

      <ClinicalNoteSelect
        petId={petId}
        defaultValue={labExam?.clinical_note_id}
        disabled={pending}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="exam_name">Nombre del examen</Label>
          <Input
            id="exam_name"
            name="exam_name"
            defaultValue={labExam?.exam_name ?? ""}
            required
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            name="category"
            value={category}
            onValueChange={(v) => setCategory(v ?? "otro")}
            disabled={pending}
          >
            <SelectTrigger id="category">
              <SelectValue>
                {(value: string) =>
                  EXAM_CATEGORY_OPTIONS.find((o) => o.value === value)?.label
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {EXAM_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sample_date">Fecha de toma de muestra</Label>
          <Input
            id="sample_date"
            name="sample_date"
            type="date"
            defaultValue={labExam?.sample_date ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="result_date">Fecha de resultado</Label>
          <Input
            id="result_date"
            name="result_date"
            type="date"
            defaultValue={labExam?.result_date ?? ""}
            required
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lab_center">Laboratorio</Label>
        <Input
          id="lab_center"
          name="lab_center"
          defaultValue={labExam?.lab_center ?? ""}
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="summary">Resumen / resultados</Label>
        <Textarea
          id="summary"
          name="summary"
          defaultValue={labExam?.summary ?? ""}
          disabled={pending}
        />
      </div>

      {labExam && labExam.lab_exam_files.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Archivos adjuntos</Label>
          <ExamFileList files={labExam.lab_exam_files} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="files">
          {labExam ? "Adjuntar archivos nuevos" : "Adjuntar archivos"}
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
