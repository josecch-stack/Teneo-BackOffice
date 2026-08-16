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
