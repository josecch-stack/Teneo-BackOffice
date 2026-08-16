import { type ComponentProps, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Matches the Figma "Text Field - Floating Label" pattern: a bordered 48px
 * box with a small muted label stacked above the value, both vertically
 * centered inside the border (not an animated float-on-focus label).
 */
export function FloatingLabelInput({
  label,
  id,
  className,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div
      className={cn(
        "focus-within:border-primary focus-within:ring-primary/30 border-border bg-card h-12 w-full rounded-lg border px-3.5 py-1.5 transition-colors focus-within:ring-4",
        className,
      )}
    >
      <label htmlFor={inputId} className="text-muted-foreground block text-xs">
        {label}
      </label>
      <input
        id={inputId}
        className="text-foreground placeholder:text-muted-foreground block w-full border-0 bg-transparent p-0 text-base leading-tight outline-none"
        {...props}
      />
    </div>
  );
}
