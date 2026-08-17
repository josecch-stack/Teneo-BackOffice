import { type ComponentProps, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Animated floating label: the label sits centered over the input like a
 * placeholder, then floats up to rest on the border (CSS-only, driven by
 * :focus and :placeholder-shown — the input needs a non-empty placeholder
 * for :placeholder-shown to correctly reflect "has a value" instead of
 * always matching).
 */
export function FloatingLabelInput({
  label,
  id,
  className,
  placeholder,
  disabled,
  ...props
}: ComponentProps<"input"> & { label: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative h-12 w-full">
      <input
        id={inputId}
        placeholder={placeholder ?? " "}
        disabled={disabled}
        className={cn(
          "peer border-border bg-card text-foreground focus:border-primary focus:ring-primary/30 h-12 w-full rounded-lg border px-3.5 text-base transition-colors outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="text-muted-foreground bg-card peer-focus:text-primary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 px-1 text-base transition-all duration-150 ease-out peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium"
      >
        {label}
      </label>
    </div>
  );
}
