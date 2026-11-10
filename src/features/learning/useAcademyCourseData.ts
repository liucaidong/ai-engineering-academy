import { useCallback, useEffect, useMemo, useState } from "react";
import { courseCatalog } from "../../data/courseCatalog";
import { loadFullCourse } from "../../data/loadFullCourse";
import { loadModuleLessons } from "../../data/moduleLessons";
import { getModuleValidationErrors } from "../../lib/validateCourse";
import type { Course, CourseModule, Lesson } from "../../types/course";

export type AcademyActiveView = "lesson" | "lab" | "authoring";

type UseAcademyCourseDataOptions = {
  selectedModuleId: string;
  activeView: AcademyActiveView;
  moduleQuery: string;
};

export function useAcademyCourseData({
  selectedModuleId,
  activeView,
  moduleQuery,
}: UseAcademyCourseDataOptions) {
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, Lesson[]>>({});
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);
  const [authoringCourse, setAuthoringCourse] = useState<Course | null>(null);
  const [authoringLoadError, setAuthoringLoadError] = useState<string | null>(null);
  const [authoringLoadAttempt, setAuthoringLoadAttempt] = useState(0);
  const [fullTextSearchModules, setFullTextSearchModules] = useState<CourseModule[] | null>(null);
  const [searchIndexLoading, setSearchIndexLoading] = useState(false);
  const [searchIndexError, setSearchIndexError] = useState(false);

  const selectedModule =
    courseCatalog.modules.find((item) => item.id === selectedModuleId) ?? courseCatalog.modules[0];
  const selectedLessons = lessonsByModule[selectedModule.id];
  const selectedLesson = selectedLessons?.[0];

  const validationErrors = useMemo(
    () => (selectedLessons ? getModuleValidationErrors(selectedModule, selectedLessons) : []),
    [selectedModule, selectedLessons],
  );

  useEffect(() => {
    if (lessonsByModule[selectedModule.id]) return;
    let cancelled = false;
    setLessonLoadError(null);
    void loadModuleLessons(selectedModule.id).then(
      (lessons) => {
        if (!cancelled) {
          setLessonsByModule((current) => ({ ...current, [selectedModule.id]: lessons }));
        }
      },
      () => {
        if (!cancelled) {
          setLessonLoadError(`课程模块 ${selectedModule.id} 加载失败，请重试。`);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [selectedModule.id, lessonsByModule]);

  useEffect(() => {
    if (activeView !== "authoring" || authoringCourse) return;
    let cancelled = false;
    setAuthoringLoadError(null);
    void loadFullCourse().then(
      (course) => {
        if (!cancelled) setAuthoringCourse(course);
      },
      () => {
        if (!cancelled) {
          setAuthoringLoadError(
            `完整课程数据加载失败（第 ${authoringLoadAttempt + 1} 次），请重试。`,
          );
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [activeView, authoringCourse, authoringLoadAttempt]);

  useEffect(() => {
    if (!moduleQuery.trim() || fullTextSearchModules) return;
    let cancelled = false;
    setSearchIndexLoading(true);
    setSearchIndexError(false);
    void loadFullCourse()
      .then(
        (fullCourse) => {
          if (!cancelled) setFullTextSearchModules(fullCourse.modules);
        },
        () => {
          if (!cancelled) setSearchIndexError(true);
        },
      )
      .finally(() => {
        if (!cancelled) setSearchIndexLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [moduleQuery, fullTextSearchModules]);

  const retryLessonLoad = useCallback(() => {
    setLessonsByModule((current) => {
      const next = { ...current };
      delete next[selectedModule.id];
      return next;
    });
    setLessonLoadError(null);
  }, [selectedModule.id]);

  const retryAuthoringLoad = useCallback(() => {
    setAuthoringLoadAttempt((attempt) => attempt + 1);
  }, []);

  return {
    authoringCourse,
    authoringLoadError,
    fullTextSearchModules,
    lessonLoadError,
    retryAuthoringLoad,
    retryLessonLoad,
    searchIndexError,
    searchIndexLoading,
    selectedLesson,
    selectedModule,
    validationErrors,
  };
}
