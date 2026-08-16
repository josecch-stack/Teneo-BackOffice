"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { updateOwner, listCommunes, type UpdateOwnerState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Region {
  id: number;
  name: string;
}

interface Commune {
  id: number;
  name: string;
}

interface OwnerFormProps {
  owner: {
    user_id: string;
    first_name: string;
    last_name: string | null;
    rut: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    condo_building: string | null;
    apt_house: string | null;
    regions: { id: number; name: string } | null;
    communes: { id: number; name: string } | null;
  };
  regions: Region[];
}

const initialState: UpdateOwnerState = {};

export function OwnerForm({ owner, regions }: OwnerFormProps) {
  const updateOwnerWithId = updateOwner.bind(null, owner.user_id);
  const [state, formAction, pending] = useActionState(
    updateOwnerWithId,
    initialState,
  );

  const [regionId, setRegionId] = useState<string>(
    owner.regions?.id.toString() ?? "",
  );
  const [communes, setCommunes] = useState<Commune[]>(
    owner.communes ? [owner.communes] : [],
  );
  const [communeId, setCommuneId] = useState<string>(
    owner.communes?.id.toString() ?? "",
  );

  useEffect(() => {
    if (!regionId) return;
    listCommunes(Number(regionId)).then(setCommunes);
  }, [regionId]);

  useEffect(() => {
    if (state.success) toast.success("Tutor actualizado.");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            id="first_name"
            name="first_name"
            defaultValue={owner.first_name}
            required
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            id="last_name"
            name="last_name"
            defaultValue={owner.last_name ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rut">RUT</Label>
          <Input
            id="rut"
            name="rut"
            placeholder="12345678-9"
            defaultValue={owner.rut ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+56912345678"
            defaultValue={owner.phone ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={owner.email ?? ""}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="region_id">Región</Label>
          <Select
            value={regionId}
            onValueChange={(value) => {
              setRegionId(value ?? "");
              setCommuneId("");
              setCommunes([]);
            }}
            disabled={pending}
          >
            <SelectTrigger id="region_id">
              <SelectValue placeholder="Selecciona una región" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id.toString()}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="region_id" value={regionId} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="commune_id">Comuna</Label>
          <Select
            value={communeId}
            onValueChange={(value) => setCommuneId(value ?? "")}
            disabled={pending || !regionId}
          >
            <SelectTrigger id="commune_id">
              <SelectValue placeholder="Selecciona una comuna" />
            </SelectTrigger>
            <SelectContent>
              {communes.map((commune) => (
                <SelectItem key={commune.id} value={commune.id.toString()}>
                  {commune.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="commune_id" value={communeId} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          name="address"
          defaultValue={owner.address ?? ""}
          disabled={pending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="condo_building">Condominio/Edificio</Label>
          <Input
            id="condo_building"
            name="condo_building"
            defaultValue={owner.condo_building ?? ""}
            disabled={pending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apt_house">Depto/Casa</Label>
          <Input
            id="apt_house"
            name="apt_house"
            defaultValue={owner.apt_house ?? ""}
            disabled={pending}
          />
        </div>
      </div>

      {state.error && (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <Button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full px-6"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}
