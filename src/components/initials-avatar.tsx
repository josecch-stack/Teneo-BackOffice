import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function InitialsAvatar({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Avatar className={cn("size-12 rounded-2xl after:rounded-2xl", className)}>
      {imageUrl && (
        <AvatarImage
          src={imageUrl}
          alt={name}
          className="rounded-2xl object-cover"
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary rounded-2xl">
        {initials || "?"}
      </AvatarFallback>
    </Avatar>
  );
}
