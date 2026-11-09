import type { Course } from "../types/course";
import { courseCatalog } from "./courseCatalog";
import { flagshipM01Lessons } from "./flagshipM01";
import { flagshipM02Lessons } from "./flagshipM02";
import { flagshipM03Lessons } from "./flagshipM03";
import { flagshipM04Lessons } from "./flagshipM04";
import { flagshipM05Lessons } from "./flagshipM05";
import { flagshipM06Lessons } from "./flagshipM06";
import { flagshipM07Lessons } from "./flagshipM07";
import { flagshipM08Lessons } from "./flagshipM08";
import { flagshipM09Lessons } from "./flagshipM09";
import { flagshipM10Lessons } from "./flagshipM10";
import { flagshipM11Lessons } from "./flagshipM11";
import { flagshipM12Lessons } from "./flagshipM12";
import { flagshipM13Lessons } from "./flagshipM13";
import { flagshipM14Lessons } from "./flagshipM14";
import { flagshipM15Lessons } from "./flagshipM15";
import { flagshipM16Lessons } from "./flagshipM16";
import { flagshipM17Lessons } from "./flagshipM17";
import { flagshipM18Lessons } from "./flagshipM18";
import { flagshipM19Lessons } from "./flagshipM19";
import { flagshipM20Lessons } from "./flagshipM20";

/**
 * Complete eager curriculum fixture for content validation, tests and explicit
 * full-course export. The application shell must import courseCatalog instead.
 */
const allLessons = {
  M01: flagshipM01Lessons,
  M02: flagshipM02Lessons,
  M03: flagshipM03Lessons,
  M04: flagshipM04Lessons,
  M05: flagshipM05Lessons,
  M06: flagshipM06Lessons,
  M07: flagshipM07Lessons,
  M08: flagshipM08Lessons,
  M09: flagshipM09Lessons,
  M10: flagshipM10Lessons,
  M11: flagshipM11Lessons,
  M12: flagshipM12Lessons,
  M13: flagshipM13Lessons,
  M14: flagshipM14Lessons,
  M15: flagshipM15Lessons,
  M16: flagshipM16Lessons,
  M17: flagshipM17Lessons,
  M18: flagshipM18Lessons,
  M19: flagshipM19Lessons,
  M20: flagshipM20Lessons,
};

export const course: Course = {
  ...courseCatalog,
  modules: courseCatalog.modules.map((module) => ({
    ...module,
    lessons: allLessons[module.id as keyof typeof allLessons],
  })),
};
