import assert from "node:assert/strict";
import test from "node:test";
import { mergeBusinessWorkspaces } from "../lib/workspaces.ts";

test("mergeBusinessWorkspaces combines owned and staffed programs", () => {
  const result = mergeBusinessWorkspaces(
    [{ id: "a", name: "Bean & Brew", slug: "bean" }],
    [{ role: "manager", programs: { id: "b", name: "Studio Nine", slug: "studio" } }],
  );
  assert.deepEqual(result, [
    { id: "a", name: "Bean & Brew", slug: "bean", role: "owner" },
    { id: "b", name: "Studio Nine", slug: "studio", role: "manager" },
  ]);
});

test("owner workspace wins over a duplicate staff membership", () => {
  const result = mergeBusinessWorkspaces(
    [{ id: "a", name: "Bean & Brew", slug: "bean" }],
    [{ role: "manager", programs: { id: "a", name: "Bean & Brew", slug: "bean" } }],
  );
  assert.equal(result.length, 1);
  assert.equal(result[0]?.role, "owner");
});

test("null staff relations are ignored", () => {
  const result = mergeBusinessWorkspaces([], [{ role: "cashier", programs: null }]);
  assert.deepEqual(result, []);
});
