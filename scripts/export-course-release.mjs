import { createServer } from "vite";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";

const outputPath = process.argv[2];
if (!outputPath) {
  console.error("Usage: node scripts/export-course-release.mjs <output.json>");
  process.exitCode = 2;
} else {
  const server = await createServer({
    configFile: resolve("vite.config.ts"),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
  });

  try {
    const [{ loadFullCourse }, { CourseSchema }] = await Promise.all([
      server.ssrLoadModule("/src/data/loadFullCourse.ts"),
      server.ssrLoadModule("/src/types/course.ts"),
    ]);
    const course = CourseSchema.parse(await loadFullCourse());
    await writeFile(resolve(outputPath), `${JSON.stringify(course, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    console.log(
      JSON.stringify({
        output: resolve(outputPath),
        courseId: course.id,
        version: course.version,
        modules: course.modules.length,
        lessons: course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
        schemaVersion: course.schemaVersion,
      }),
    );
  } finally {
    await server.close();
  }
}
