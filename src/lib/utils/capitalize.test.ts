import { describe, expect, it } from "vitest";
import { capitalizeWords } from "./capitalize";

describe("capitalizeWords", () => {
  it("capitalizes a single lowercase word", () => {
    expect(capitalizeWords("firulais")).toBe("Firulais");
  });

  it("capitalizes each word of a multi-word name", () => {
    expect(capitalizeWords("juan carlos perez")).toBe("Juan Carlos Perez");
  });

  it("lowercases the rest of an all-caps word", () => {
    expect(capitalizeWords("MAX")).toBe("Max");
  });

  it("collapses extra whitespace", () => {
    expect(capitalizeWords("  ana   maria  ")).toBe("Ana Maria");
  });

  it("handles accented characters", () => {
    expect(capitalizeWords("óscar muñoz")).toBe("Óscar Muñoz");
  });
});
