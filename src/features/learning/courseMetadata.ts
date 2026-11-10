import { courseCatalog } from "../../data/courseCatalog";
import type { CourseModule } from "../../types/course";
import { LAB_COMPONENTS } from "../labs/labRegistry";

export const LEVEL_LABELS: Record<CourseModule["level"], string> = {
  L1: "基础认知",
  L2: "模型原理",
  L3: "应用工程",
  L4: "Agent 工程",
  L5: "平台工程",
  L6: "综合实践",
};

export const IMPLEMENTED_LABS = new Set(
  courseCatalog.labs
    .filter((lab) => lab.status === "implemented" && lab.id in LAB_COMPONENTS)
    .map((lab) => lab.id),
);
