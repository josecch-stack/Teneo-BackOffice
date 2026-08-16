/**
 * The mobile app stores full public URLs in file columns (confirmed via
 * real data during Fase 9 discovery, e.g.
 * `https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}`)
 * — not bare object paths. `createSignedUrl`/`.remove()` need the bare path.
 * This normalizes either form (a full public URL or an already-bare path,
 * e.g. one this panel wrote in Fase 4 before this was discovered) into the
 * path Storage APIs expect.
 */
export function extractStoragePath(
  fileUrlOrPath: string,
  bucket: string,
): string {
  const marker = `/object/public/${bucket}/`;
  const idx = fileUrlOrPath.indexOf(marker);
  if (idx === -1) return fileUrlOrPath;
  return fileUrlOrPath.slice(idx + marker.length);
}
