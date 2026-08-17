"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex w-[331px] flex-col gap-8">
      <h1 className="text-foreground text-3xl font-bold">Iniciar sesión</h1>
      <form action={formAction} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <FloatingLabelInput
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
          />
          <FloatingLabelInput
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
        </div>

        <Link
          href="/forgot-password"
          className="text-primary -mt-2 self-end text-sm font-semibold"
        >
          ¿Olvidaste tu contraseña?
        </Link>

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
          {pending ? "Ingresando..." : "Iniciar sesión"}
        </Button>
      </form>
    </div>
  );
}
