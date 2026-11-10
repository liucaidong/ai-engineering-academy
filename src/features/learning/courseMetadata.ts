import { courseCatalog } from "../../data/courseCatalog";
import type { CourseModule } from "../../types/course";

export const LEVEL_LABELS: Record<CourseModule["level"], string> = {
  L1: "基础认知",
  L2: "模型原理",
  L3: "应用工程",
  L4: "Agent 工程",
  L5: "平台工程",
  L6: "综合实践",
};

export const IMPLEMENTED_LABS = new Set(
  courseCatalog.labs.filter((lab) => lab.status === "implemented").map((lab) => lab.id),
);
