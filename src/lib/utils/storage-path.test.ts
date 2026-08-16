import { describe, expect, it } from "vitest";
import { extractStoragePath } from "./storage-path";

describe("extractStoragePath", () => {
  it("extracts the object path from a full public URL", () => {
    const url =
      "https://pwgpwxeyptnqmpzeneml.supabase.co/storage/v1/object/public/exam-files/78140542-d9db-4d69-8092-bc3d4b1d8902/exam-files/lab_exam_1784220288178.jpg";
    expect(extractStoragePath(url, "exam-files")).toBe(
      "78140542-d9db-4d69-8092-bc3d4b1d8902/exam-files/lab_exam_1784220288178.jpg",
    );
  });

  it("returns an already-bare path unchanged", () => {
    const path =
      "78140542-d9db-4d69-8092-bc3d4b1d8902/exam-files/some-file.png";
    expect(extractStoragePath(path, "exam-files")).toBe(path);
  });

  it("only strips the marker for the given bucket", () => {
    const url =
      "https://x.supabase.co/storage/v1/object/public/other-bucket/foo.jpg";
    expect(extractStoragePath(url, "exam-files")).toBe(url);
  });
});
