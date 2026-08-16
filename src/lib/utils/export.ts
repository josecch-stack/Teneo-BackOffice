import ExcelJS from "exceljs";
import Papa from "papaparse";

export interface ExportColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null;
}

/** Leading BOM so Excel opens UTF-8 correctly (á, ñ, etc.) instead of mangling accents. */
export function toCSV<T>(rows: T[], columns: ExportColumn<T>[]): string {
  const headers = columns.map((c) => c.header);
  const data = rows.map((row) => columns.map((c) => c.value(row) ?? ""));
  const BOM = String.fromCharCode(0xfeff);
  return BOM + Papa.unparse({ fields: headers, data });
}

export async function toXLSX<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  sheetName: string,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: c.header,
    width: 22,
  }));
  sheet.getRow(1).font = { bold: true };
  for (const row of rows) {
    sheet.addRow(
      Object.fromEntries(columns.map((c) => [c.header, c.value(row) ?? ""])),
    );
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
