import { describe, expect, it } from "vitest";
import { parseCodepointList, codepointsFromText } from "./unicode-presets.js";

describe("unicode helpers", () => {
  it("parses codepoint list", () => {
    expect(parseCodepointList("48 65 6c")).toEqual([0x48, 0x65, 0x6c]);
    expect(parseCodepointList("65")).toEqual([65]);
    expect(parseCodepointList("U+0048")).toEqual([0x48]);
  });

  it("extracts from text", () => {
    const cps = codepointsFromText("Hi");
    expect(cps).toContain(0x48);
    expect(cps).toContain(0x69);
  });
});
