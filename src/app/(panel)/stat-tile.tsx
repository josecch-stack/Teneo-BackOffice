export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-card flex w-[241px] flex-col gap-2 rounded-2xl border p-6">
      <span className="text-foreground text-sm">{label}</span>
      <span className="text-foreground text-3xl font-bold tabular-nums">
        {value.toLocaleString("es-CL")}
      </span>
    </div>
  );
}
