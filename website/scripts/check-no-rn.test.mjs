import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findRnUsage } from "./check-no-rn.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => join(here, "__fixtures__", "check-no-rn", name);

test("clean tree has no hits", () => {
  assert.deepEqual(findRnUsage(fixture("clean")), []);
});

test("flags a forbidden package.json dependency", () => {
  assert.deepEqual(findRnUsage(fixture("dep")), [
    { file: "package.json", match: "react-native-svg" },
  ]);
});

test("flags an import specifier but not a comment", () => {
  assert.deepEqual(findRnUsage(fixture("import")), [
    { file: "src/a.tsx", match: "react-native" },
  ]);
});

test("website has no react-native usage", () => {
  assert.deepEqual(findRnUsage(join(here, "..")), []);
});
