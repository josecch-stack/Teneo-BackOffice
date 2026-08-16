"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/dal";
import { writeAuditLog } from "@/lib/audit/log";

const PAGE_SIZE = 20;

export interface ListNotificationsParams {
  q?: string;
  status?: "sent" | "pending";
  page?: number;
}

export async function listNotifications(params: ListNotificationsParams) {
  await requirePermission("notification:read");
  const supabase = await createClient();

  const page = Math.max(params.page ?? 1, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("notifications")
    .select(
      "id, notification_type, title, message, trigger_date, sent_at, is_read, pets(name), owners(first_name, last_name)",
      { count: "exact" },
    );

  if (params.status === "sent") query = query.not("sent_at", "is", null);
  if (params.status === "pending") query = query.is("sent_at", null);
  if (params.q) {
    const q = params.q.trim();
    query = query.or(`title.ilike.%${q}%,message.ilike.%${q}%`);
  }

  const { data, count, error } = await query
    .order("trigger_date", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("listNotifications failed", error);
    return { rows: [], rowCount: 0, pageCount: 0, page };
  }

  const rowCount = count ?? 0;
  return {
    rows: data ?? [],
    rowCount,
    pageCount: Math.max(Math.ceil(rowCount / PAGE_SIZE), 1),
    page,
  };
}

export interface SendNotificationState {
  error?: string;
  success?: boolean;
}

export async function sendManualNotification(
  _prevState: SendNotificationState,
  formData: FormData,
): Promise<SendNotificationState> {
  await requirePermission("notification:send");

  const petId = formData.get("pet_id");
  const title = formData.get("title");
  const message = formData.get("message");

  if (typeof petId !== "string" || !petId)
    return { error: "Selecciona una mascota." };
  if (typeof title !== "string" || !title.trim())
    return { error: "El título es obligatorio." };
  if (typeof message !== "string" || !message.trim())
    return { error: "El mensaje es obligatorio." };

  const supabase = await createClient();

  const { data: pet } = await supabase
    .from("pets")
    .select("owner_id")
    .eq("id", petId)
    .single();
  if (!pet) return { error: "Mascota no encontrada." };

  const { data: created, error } = await supabase
    .from("notifications")
    .insert({
      owner_id: pet.owner_id,
      pet_id: petId,
      notification_type: "manual",
      title: title.trim(),
      message: message.trim(),
      trigger_date: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "No se pudo crear la notificación. Intenta de nuevo." };
  }

  await writeAuditLog({
    action: "send",
    resource: "notification",
    recordId: created.id,
    newValues: { petId, title, message },
  });

  // Trigger delivery right away instead of waiting for tomorrow's cron —
  // best-effort: if the Edge Function call fails, the notification row
  // still exists and the next scheduled run will pick it up.
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-push-notifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );
  } catch (e) {
    console.error(
      "Immediate push delivery trigger failed (will retry on next cron run)",
      e,
    );
  }

  revalidatePath("/notifications");
  return { success: true };
}
