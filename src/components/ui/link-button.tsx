import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The Button primitive (@base-ui/react) uses a `render` prop for
 * polymorphism, but its own docs say links shouldn't be rendered through it
 * ("Links have their own semantics and should not be rendered as buttons
 * through the render prop") — style the <a> directly instead. This wraps
 * that pattern so call sites don't repeat it.
 */
export function LinkButton({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof Link> & Parameters<typeof buttonVariants>[0]) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
