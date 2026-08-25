import { notFound } from "next/navigation";
import { getOwner, listRegions } from "../actions";
import { OwnerForm } from "./owner-form";
import { DeleteOwnerButton } from "./delete-owner-button";
import { PremiumToggle } from "../premium-toggle";
import { verifySession, hasPermission } from "@/lib/auth/dal";
import { Label } from "@/components/ui/label";

export default async function OwnerDetailPage(
  props: PageProps<"/owners/[user_id]">,
) {
  const { user_id } = await props.params;
  const [session, owner, regions] = await Promise.all([
    verifySession(),
    getOwner(user_id),
    listRegions(),
  ]);

  if (!owner) notFound();

  const ownerName = `${owner.first_name} ${owner.last_name ?? ""}`.trim();
  const canWritePremium = hasPermission(session, "subscription:write");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{ownerName}</h1>
          <p className="text-muted-foreground text-sm">Ficha de tutor</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <PremiumToggle
              userId={user_id}
              premium={owner.subscriptions?.status === "active"}
              disabled={!canWritePremium}
            />
            <Label className="font-normal">Premium</Label>
          </div>
          <DeleteOwnerButton userId={user_id} ownerName={ownerName} />
        </div>
      </div>

      <OwnerForm owner={owner} regions={regions} />
    </div>
  );
}
