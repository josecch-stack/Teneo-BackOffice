"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  exchangeRecoveryCode,
  updatePassword,
  type UpdatePasswordState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

const initialState: UpdatePasswordState = {};

type LinkStatus = "checking" | "ready" | "invalid";

export function ResetPasswordForm({ code }: { code?: string }) {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  );
  const [status, setStatus] = useState<LinkStatus>(
    code ? "checking" : "invalid",
  );
  // Supabase's code is single-use — exchanging it twice fails the second
  // time. Guards against React's dev-mode Strict Mode double-invoking this
  // effect (mount → cleanup → mount again), which would otherwise burn the
  // one real code on the throwaway first attempt.
  const attempted = useRef(false);

  useEffect(() => {
    if (!code || attempted.current) return;
    attempted.current = true;
    exchangeRecoveryCode(code).then((ok) =>
      setStatus(ok ? "ready" : "invalid"),
    );
  }, [code]);

  if (status === "checking") {
    return (
      <p className="text-muted-foreground text-sm">Verificando enlace...</p>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex w-full max-w-[331px] flex-col gap-4 text-center">
        <h1 className="text-foreground text-3xl font-bold">Enlace inválido</h1>
        <p className="text-muted-foreground text-sm">
          El enlace expiró o ya se usó. Solicita uno nuevo.
        </p>
        <Link
          href="/forgot-password"
          className="text-primary text-sm font-semibold"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[331px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold">
          Crea una nueva contraseña
        </h1>
        <p className="text-muted-foreground text-sm">
          Debe tener al menos 8 caracteres.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-6">
        <FloatingLabelInput
          label="Nueva contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
        />

        {state?.error && (
          <p className="text-destructive text-sm" role="alert">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full text-base"
        >
          {pending ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </form>
    </div>
  );
}
