import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const temporaryDirectory = mkdtempSync(join(tmpdir(), "aea-openapi-check-"));
const temporarySchema = join(temporaryDirectory, "openapi.json");
const temporaryTypes = join(temporaryDirectory, "generated.ts");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status ?? "unknown"}`);
  }
}

try {
  run(
    "uv",
    [
      "run",
      "--project",
      "backend",
      "--locked",
      "--python",
      "3.12.14",
      "--default-index",
      "https://pypi.org/simple",
      "python",
      "backend/scripts/export_openapi.py",
      "--output",
      temporarySchema,
    ],
    { env: { ...process.env, PYTHONPATH: join(root, "backend") } },
  );
  run("pnpm", ["exec", "openapi-typescript", temporarySchema, "--output", temporaryTypes]);

  const committedSchema = readFileSync(join(root, "openapi/openapi.json"), "utf8");
  const committedTypes = readFileSync(join(root, "src/api/generated.ts"), "utf8");
  const actualSchema = readFileSync(temporarySchema, "utf8");
  const actualTypes = readFileSync(temporaryTypes, "utf8");
  const mismatches = [];
  if (committedSchema !== actualSchema) mismatches.push("openapi/openapi.json");
  if (committedTypes !== actualTypes) mismatches.push("src/api/generated.ts");

  if (mismatches.length > 0) {
    console.error(
      "OpenAPI contract drift detected: " +
        mismatches.join(", ") +
        ". Run pnpm api:generate and review the diff.",
    );
    process.exitCode = 1;
  } else {
    console.log("OpenAPI contract is in sync with FastAPI source.");
  }
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
