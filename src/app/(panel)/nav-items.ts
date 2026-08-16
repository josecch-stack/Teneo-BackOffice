import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  Syringe,
  Bug,
  AlertTriangle,
  Stethoscope,
  FlaskConical,
  CalendarDays,
  CreditCard,
  Share2,
  Settings,
  ShieldCheck,
  UserCog,
  FileBarChart,
  FileText,
  Bell,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  implemented: boolean;
  /** If set, hidden from the sidebar unless the session carries this permission. */
  permission?: `${string}:${string}`;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

// Mirrors section 5 of prompt-backend-admin-teneo-pet.md, grouped to match
// the Figma sidebar pattern (Dashboard V1.0). Items land as each phase of
// docs/module-mapping.md ships — see docs/plan-fases.md.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        implemented: true,
      },
    ],
  },
  {
    label: "Usuarios",
    items: [
      { href: "/owners", label: "Tutores", icon: Users, implemented: true },
      { href: "/pets", label: "Mascotas", icon: PawPrint, implemented: true },
      {
        href: "/panel-users",
        label: "Usuarios del panel",
        icon: UserCog,
        implemented: true,
        permission: "role:manage",
      },
    ],
  },
  {
    label: "Tratamientos",
    items: [
      { href: "/vaccines", label: "Vacunas", icon: Syringe, implemented: true },
      {
        href: "/dewormings",
        label: "Desparasitación",
        icon: Bug,
        implemented: true,
      },
      {
        href: "/vencimientos",
        label: "Vencimientos",
        icon: AlertTriangle,
        implemented: true,
      },
      {
        href: "/clinical-notes",
        label: "Notas clínicas",
        icon: Stethoscope,
        implemented: true,
      },
      {
        href: "/exams",
        label: "Exámenes",
        icon: FlaskConical,
        implemented: true,
      },
    ],
  },
  {
    label: "Calendario",
    items: [
      {
        href: "/calendar",
        label: "Calendario",
        icon: CalendarDays,
        implemented: true,
      },
    ],
  },
  {
    label: "Notificaciones",
    items: [
      {
        href: "/notifications",
        label: "Notificaciones",
        icon: Bell,
        implemented: true,
        permission: "notification:read",
      },
    ],
  },
  {
    label: "Reportes",
    items: [
      {
        href: "/reports",
        label: "Reportes",
        icon: FileBarChart,
        implemented: true,
        permission: "export:bulk",
      },
    ],
  },
  {
    label: "Suscripciones",
    items: [
      {
        href: "/subscriptions",
        label: "Suscripciones",
        icon: CreditCard,
        implemented: true,
        permission: "subscription:read",
      },
    ],
  },
  {
    label: "Otros",
    items: [
      {
        href: "/pet-shares",
        label: "Compartir mascota",
        icon: Share2,
        implemented: true,
        permission: "pet_share:read",
      },
      {
        href: "/documents",
        label: "Documentos",
        icon: FileText,
        implemented: true,
        permission: "document:read",
      },
      {
        href: "/settings",
        label: "Configuración",
        icon: Settings,
        implemented: true,
        permission: "catalog:manage",
      },
      {
        href: "/audit",
        label: "Auditoría",
        icon: ShieldCheck,
        implemented: false,
      },
    ],
  },
];
