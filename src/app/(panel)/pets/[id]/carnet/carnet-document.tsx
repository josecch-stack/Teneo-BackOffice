import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatAge } from "@/lib/utils/age";
import { SPECIES_OPTIONS } from "@/lib/validations/pet";
import { CLINICAL_EVENT_TYPE_LABELS } from "@/lib/validations/clinical-note";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#131214",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
    borderBottom: "2pt solid #4160e9",
    paddingBottom: 8,
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#4160e9" },
  subtitle: { fontSize: 9, color: "#6e7375" },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#131214",
  },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 110, color: "#6e7375" },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  table: { display: "flex", width: "auto" },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5pt solid #e6e9eb",
    paddingVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #131214",
    paddingVertical: 4,
  },
  th: { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 9 },
  td: { flex: 1, fontSize: 9 },
  empty: { fontSize: 9, color: "#6e7375", fontStyle: "italic" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#6e7375",
    textAlign: "center",
    borderTop: "0.5pt solid #e6e9eb",
    paddingTop: 6,
  },
  alertBox: {
    backgroundColor: "#fdecea",
    border: "1pt solid #d32f2f",
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#d32f2f",
    marginBottom: 3,
  },
  alertText: { fontSize: 9, color: "#131214" },
  historyItem: {
    marginBottom: 6,
    paddingBottom: 6,
    borderBottom: "0.5pt solid #e6e9eb",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  historyType: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  historyDate: { fontSize: 9, color: "#6e7375" },
  historyNotes: { fontSize: 9 },
  identRow: { flexDirection: "row" },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    objectFit: "cover",
  },
  identFields: { flex: 1 },
});

const fmt = (value: string | null | undefined) =>
  value ? format(new Date(value), "dd/MM/yyyy", { locale: es }) : "—";

interface CarnetPet {
  name: string;
  species: string;
  custom_species: string | null;
  breed: string | null;
  birth_date: string;
  sex: string | null;
  color: string | null;
  weight_kg: number | null;
  is_sterilized: boolean | null;
  chip_number: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  health_notes: string | null;
  owners: {
    first_name: string;
    last_name: string | null;
    rut: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  } | null;
}

interface CarnetVaccine {
  vaccine_name: string;
  application_type: string | null;
  application_date: string | null;
  next_dose_date: string | null;
  brand_lab: string | null;
  vet_name: string | null;
}

interface CarnetDeworming {
  product: string;
  type: string;
  application_date: string;
  next_dose_date: string | null;
}

interface CarnetClinicalNote {
  event_type: string | null;
  event_date: string;
  notes_diagnosis: string;
}

const speciesLabel = (species: string, custom: string | null) =>
  species === "otro"
    ? (custom ?? "Otro")
    : (SPECIES_OPTIONS.find((s) => s.value === species)?.label ?? species);

export function CarnetDocument({
  pet,
  photoDataUri,
  vaccines,
  dewormings,
  clinicalNotes,
  generatedAt,
}: {
  pet: CarnetPet;
  photoDataUri: string | null;
  vaccines: CarnetVaccine[];
  dewormings: CarnetDeworming[];
  clinicalNotes: CarnetClinicalNote[];
  generatedAt: Date;
}) {
  const ownerName = pet.owners
    ? `${pet.owners.first_name} ${pet.owners.last_name ?? ""}`.trim()
    : "—";

  return (
    <Document title={`Carnet - ${pet.name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Teneo Pet</Text>
            <Text style={styles.subtitle}>Carnet digital de salud</Text>
          </View>
          <Text style={styles.subtitle}>
            Generado el{" "}
            {format(generatedAt, "dd/MM/yyyy HH:mm", { locale: es })}
          </Text>
        </View>

        {pet.health_notes && (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠ Alerta médica</Text>
            <Text style={styles.alertText}>{pet.health_notes}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mascota</Text>
          <View style={styles.identRow}>
            {photoDataUri && <Image src={photoDataUri} style={styles.photo} />}
            <View style={styles.identFields}>
              <View style={styles.row}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>{pet.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Especie / Raza</Text>
                <Text style={styles.value}>
                  {speciesLabel(pet.species, pet.custom_species)}
                  {pet.breed ? ` — ${pet.breed}` : ""}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Nacimiento / Edad</Text>
                <Text style={styles.value}>
                  {fmt(pet.birth_date)} ({formatAge(new Date(pet.birth_date))})
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Sexo</Text>
                <Text style={styles.value}>
                  {pet.sex === "macho"
                    ? "Macho"
                    : pet.sex === "hembra"
                      ? "Hembra"
                      : "—"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Color / Peso</Text>
                <Text style={styles.value}>
                  {pet.color ?? "—"}{" "}
                  {pet.weight_kg ? `— ${pet.weight_kg} kg` : ""}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Esterilizado</Text>
                <Text style={styles.value}>
                  {pet.is_sterilized ? "Sí" : "No"}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>N° de chip</Text>
                <Text style={styles.value}>{pet.chip_number ?? "—"}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Veterinario de cabecera</Text>
                <Text style={styles.value}>
                  {pet.vet_name ?? "—"}{" "}
                  {pet.vet_phone ? `— ${pet.vet_phone}` : ""}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tutor</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{ownerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>RUT</Text>
            <Text style={styles.value}>{pet.owners?.rut ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contacto</Text>
            <Text style={styles.value}>
              {pet.owners?.phone ?? "—"}{" "}
              {pet.owners?.email ? `— ${pet.owners.email}` : ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{pet.owners?.address ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vacunas ({vaccines.length})</Text>
          {vaccines.length === 0 ? (
            <Text style={styles.empty}>Sin vacunas registradas.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.th}>Vacuna</Text>
                <Text style={styles.th}>Tipo</Text>
                <Text style={styles.th}>Aplicación</Text>
                <Text style={styles.th}>Próxima dosis</Text>
                <Text style={styles.th}>Marca/Lab</Text>
              </View>
              {vaccines.map((v, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.td}>{v.vaccine_name}</Text>
                  <Text style={styles.td}>
                    {v.application_type === "refuerzo"
                      ? "Refuerzo"
                      : v.application_type === "anual"
                        ? "Anual"
                        : "—"}
                  </Text>
                  <Text style={styles.td}>{fmt(v.application_date)}</Text>
                  <Text style={styles.td}>{fmt(v.next_dose_date)}</Text>
                  <Text style={styles.td}>{v.brand_lab ?? "—"}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Desparasitación ({dewormings.length})
          </Text>
          {dewormings.length === 0 ? (
            <Text style={styles.empty}>Sin desparasitaciones registradas.</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.th}>Producto</Text>
                <Text style={styles.th}>Tipo</Text>
                <Text style={styles.th}>Aplicación</Text>
                <Text style={styles.th}>Próxima dosis</Text>
              </View>
              {dewormings.map((d, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.td}>{d.product}</Text>
                  <Text style={styles.td}>{d.type}</Text>
                  <Text style={styles.td}>{fmt(d.application_date)}</Text>
                  <Text style={styles.td}>{fmt(d.next_dose_date)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Historial clínico ({clinicalNotes.length})
          </Text>
          {clinicalNotes.length === 0 ? (
            <Text style={styles.empty}>Sin eventos clínicos registrados.</Text>
          ) : (
            clinicalNotes.map((note, i) => (
              <View key={i} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>
                    {note.event_type
                      ? (CLINICAL_EVENT_TYPE_LABELS[note.event_type] ??
                        note.event_type)
                      : "Evento"}
                  </Text>
                  <Text style={styles.historyDate}>{fmt(note.event_date)}</Text>
                </View>
                <Text style={styles.historyNotes}>{note.notes_diagnosis}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footer} fixed>
          Documento generado por Teneo Pet Backoffice · Uso informativo, no
          reemplaza el carnet físico emitido por tu veterinario.
        </Text>
      </Page>
    </Document>
  );
}
