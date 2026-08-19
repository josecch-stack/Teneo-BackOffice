export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: "active", label: "Activa" },
  { value: "cancelled", label: "Cancelada" },
  { value: "past_due", label: "Pago atrasado" },
  { value: "trialing", label: "En prueba" },
  { value: "inactive", label: "Inactiva" },
] as const;

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> =
  Object.fromEntries(
    SUBSCRIPTION_STATUS_OPTIONS.map((o) => [o.value, o.label]),
  );

export const SUBSCRIPTION_STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-muted text-muted-foreground",
  past_due: "bg-destructive/10 text-destructive",
  trialing: "bg-amber-500/10 text-amber-600",
  inactive: "bg-muted text-muted-foreground",
};

// G13 (docs/gaps.md): el cobro real es vía Apple/Google IAP, no Stripe — ver
// Propuesta 14 en docs/migrations-propuestas.md. "card" cubre el checkout
// con tarjeta que muestra el Figma de la app (posible ruta web/alterna al
// IAP nativo), no es un cuarto proveedor.
export const SUBSCRIPTION_PAYMENT_METHOD_OPTIONS = [
  { value: "apple", label: "Apple Pay" },
  { value: "google", label: "Google Pay" },
  { value: "card", label: "Tarjeta de crédito" },
] as const;

export const SUBSCRIPTION_PAYMENT_METHOD_LABELS: Record<string, string> =
  Object.fromEntries(
    SUBSCRIPTION_PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label]),
  );
