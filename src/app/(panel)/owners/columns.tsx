"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDateCL } from "@/lib/utils/date";
import { InitialsAvatar } from "@/components/initials-avatar";
import { Badge } from "@/components/ui/badge";

export interface OwnerRow {
  user_id: string;
  first_name: string;
  last_name: string | null;
  rut: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  regions: { name: string } | null;
  communes: { name: string } | null;
  pet_shares: { count: number }[] | null;
  // subscriptions.owner_id is UNIQUE — an owner has at most one subscription
  // ever, so PostgREST embeds it as a single object, never an array.
  subscriptions: {
    plan_name: string;
    status: string;
    price: number | null;
  } | null;
}

export const ownerColumns: ColumnDef<OwnerRow>[] = [
  {
    id: "first_name",
    accessorKey: "first_name",
    header: "Tutor",
    cell: ({ row }) => {
      const fullName =
        `${row.original.first_name} ${row.original.last_name ?? ""}`.trim();
      return (
        <Link
          href={`/owners/${row.original.user_id}`}
          className="flex items-center gap-3"
        >
          <InitialsAvatar name={fullName} />
          <span className="flex flex-col">
            <span className="text-foreground font-bold">{fullName}</span>
            {row.original.email && (
              <span className="text-muted-foreground text-sm underline">
                {row.original.email}
              </span>
            )}
          </span>
        </Link>
      );
    },
  },
  {
    id: "rut",
    header: "RUT",
    enableSorting: false,
    cell: ({ row }) => row.original.rut ?? "—",
  },
  {
    id: "phone",
    header: "Teléfono",
    enableSorting: false,
    cell: ({ row }) => row.original.phone ?? "—",
  },
  {
    id: "commune",
    header: "Comuna",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.communes?.name
        ? `${row.original.communes.name}, ${row.original.regions?.name ?? ""}`
        : "—",
  },
  {
    id: "subscription",
    header: "Suscripción",
    enableSorting: false,
    cell: ({ row }) => {
      const sub = row.original.subscriptions;
      return sub && sub.status === "active" ? (
        <Badge className="bg-amber-500/10 text-amber-600">
          {sub.plan_name}
        </Badge>
      ) : (
        <span className="text-muted-foreground">Free</span>
      );
    },
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Registrado",
    cell: ({ row }) => formatDateCL(row.original.created_at),
  },
  {
    id: "pet_shares",
    header: "Comparte",
    enableSorting: false,
    cell: ({ row }) => {
      const count = row.original.pet_shares?.[0]?.count ?? 0;
      return count > 0 ? (
        <Badge className="bg-primary/10 text-primary">{count}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
];
