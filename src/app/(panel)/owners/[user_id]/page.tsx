import { notFound } from "next/navigation";
import { getOwner, listRegions } from "../actions";
import { OwnerForm } from "./owner-form";
import { DeleteOwnerButton } from "./delete-owner-button";

export default async function OwnerDetailPage(
  props: PageProps<"/owners/[user_id]">,
) {
  const { user_id } = await props.params;
  const [owner, regions] = await Promise.all([
    getOwner(user_id),
    listRegions(),
  ]);

  if (!owner) notFound();

  const ownerName = `${owner.first_name} ${owner.last_name ?? ""}`.trim();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{ownerName}</h1>
          <p className="text-muted-foreground text-sm">Ficha de tutor</p>
        </div>
        <DeleteOwnerButton userId={user_id} ownerName={ownerName} />
      </div>

      <OwnerForm owner={owner} regions={regions} />
    </div>
  );
}
