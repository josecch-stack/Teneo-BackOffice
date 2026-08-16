export const DOCUMENT_TYPE_OPTIONS = [
  { value: "chip_certificate", label: "Certificado de chip" },
  { value: "vaccine_receipt", label: "Comprobante de vacuna" },
  { value: "prescription", label: "Receta" },
  { value: "lab_exam_file", label: "Examen de laboratorio" },
  { value: "imaging_exam_file", label: "Examen de imagenología" },
] as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);
