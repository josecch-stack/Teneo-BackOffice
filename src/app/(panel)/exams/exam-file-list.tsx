"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getExamFileSignedUrl } from "./actions";

export function ExamFileList({
  files,
}: {
  files: { id: string; file_name: string | null; file_url: string }[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function openFile(id: string, fileUrl: string) {
    setLoadingId(id);
    try {
      const signedUrl = await getExamFileSignedUrl(fileUrl);
      if (!signedUrl) {
        toast.error("No se pudo generar el enlace del archivo.");
        return;
      }
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } finally {
      setLoadingId(null);
    }
  }

  if (!files.length) {
    return (
      <p className="text-muted-foreground text-sm">Sin archivos adjuntos.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {files.map((file) => (
        <li key={file.id}>
          <button
            type="button"
            onClick={() => openFile(file.id, file.file_url)}
            disabled={loadingId === file.id}
            className="text-primary flex items-center gap-2 text-sm hover:underline disabled:opacity-50"
          >
            {loadingId === file.id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            {file.file_name ?? "Archivo"}
          </button>
        </li>
      ))}
    </ul>
  );
}
