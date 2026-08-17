"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

const initialState: ForgotPasswordState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.success) {
    return (
      <div className="flex w-[331px] flex-col gap-6 text-center">
        <h1 className="text-foreground text-3xl font-bold">Revisa tu correo</h1>
        <p className="text-muted-foreground text-sm">
          Si el correo existe en nuestro sistema, te enviamos instrucciones para
          restaurar tu contraseña.
        </p>
        <Link href="/login" className="text-primary text-sm font-semibold">
          Regresar a Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-[331px] flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold">
          Olvidaste tu contraseña
        </h1>
        <p className="text-muted-foreground text-sm">
          Enviar instrucciones para restaurar contraseña a
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-6">
        <FloatingLabelInput
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
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
          {pending ? "Enviando..." : "Enviar"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Regresar a{" "}
          <Link href="/login" className="text-primary font-semibold">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
