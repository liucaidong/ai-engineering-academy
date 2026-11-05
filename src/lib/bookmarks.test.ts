import { describe, expect, it } from "vitest";
import { loadBookmarks, serializeBookmarks, toggleBookmark } from "./bookmarks";

describe("browser-local module bookmarks", () => {
  it("round-trips known module IDs", () => {
    expect(loadBookmarks(serializeBookmarks(["M01", "M03"]), ["M01", "M02", "M03"])).toEqual(["M01", "M03"]);
  });
  it("filters unknown and duplicate IDs", () => {
    expect(loadBookmarks(JSON.stringify({ version: 1, moduleIds: ["M01", "M99", "M01"] }), ["M01"])).toEqual(["M01"]);
  });
  it("ignores malformed and unsupported data", () => {
    expect(loadBookmarks("{", ["M01"])).toEqual([]);
    expect(loadBookmarks(JSON.stringify({ version: 2, moduleIds: ["M01"] }), ["M01"])).toEqual([]);
  });
  it("toggles bookmarks without mutating the original array", () => {
    const current = ["M01"];
    expect(toggleBookmark(current, "M02")).toEqual(["M01", "M02"]);
    expect(toggleBookmark(current, "M01")).toEqual([]);
    expect(current).toEqual(["M01"]);
  });
});
