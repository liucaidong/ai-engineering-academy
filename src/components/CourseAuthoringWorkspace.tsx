import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import type { Course } from "../types/course";
import { validateCourse } from "../lib/validateCourse";

const STORAGE_KEY = "ai-engineering-academy:authoring-draft:v1";
const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

type ValidationResult =
  | { valid: true; course: Course; errors: [] }
  | { valid: false; course: null; errors: string[] };

function validateSource(source: string): ValidationResult {
  try {
    const parsed: unknown = JSON.parse(source);
    return { valid: true, course: validateCourse(parsed), errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知校验错误";
    return { valid: false, course: null, errors: message.split("\n").slice(0, 30) };
  }
}

type Props = { initialCourse: Course };

export default function CourseAuthoringWorkspace({ initialCourse }: Props) {
  const initialSource = JSON.stringify(initialCourse, null, 2);
  const [source, setSource] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved && saved.length <= MAX_IMPORT_BYTES ? saved : initialSource;
    } catch {
      return initialSource;
    }
  });
  const result = useMemo(() => validateSource(source), [source]);

  useEffect(() => {
    if (source.length > MAX_IMPORT_BYTES) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, source);
    } catch {
      // Draft persistence is best-effort and never blocks editing.
    }
  }, [source]);

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      window.alert("导入文件超过 2 MiB 限制。");
      return;
    }
    try {
      setSource(await file.text());
    } catch {
      window.alert("无法读取所选文件。");
    }
  };

  const exportFile = () => {
    if (!result.valid) return;
    const blob = new Blob([JSON.stringify(result.course, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${result.course.id}-course.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="lesson-card authoring-workspace" aria-labelledby="authoring-title">
      <span className="eyebrow">LOCAL CONTENT AUTHORING</span>
      <h2 id="authoring-title">课程内容编辑器</h2>
      <p className="lesson-summary">
        编辑课程 JSON 草稿，执行与平台一致的 Schema 校验，再导出可提交的课程文件。
        草稿仅保存在当前浏览器，不会修改线上课程，也不会上传到服务器。
      </p>
      <div className="authoring-toolbar">
        <label className="authoring-file-label">
          导入 JSON
          <input aria-label="导入课程 JSON 文件" type="file" accept="application/json,.json" onChange={importFile} />
        </label>
        <button type="button" className="secondary-button" onClick={() => setSource(initialSource)}>恢复仓库课程</button>
        <button type="button" className="primary-button" disabled={!result.valid} onClick={exportFile}>导出已校验 JSON</button>
      </div>
      <div className="authoring-status" role="status" aria-live="polite">
        <strong>{result.valid ? "Schema 校验通过" : "Schema 校验未通过"}</strong>
        <span>{result.valid ? `${result.course.modules.length} 个模块 · Schema v${result.course.schemaVersion}` : `${result.errors.length} 项错误 / 解析信息`}</span>
      </div>
      {!result.valid && (
        <div className="validation-warning" role="alert">
          <strong>修复以下问题后才能导出：</strong>
          <ul>{result.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
        </div>
      )}
      <label className="field-label" htmlFor="course-json-editor">课程 JSON（最大 2 MiB）</label>
      <textarea
        id="course-json-editor"
        className="authoring-editor"
        spellCheck={false}
        value={source}
        maxLength={MAX_IMPORT_BYTES}
        onChange={(event) => setSource(event.target.value)}
        aria-describedby="authoring-storage-note"
      />
      <p id="authoring-storage-note" className="assessment-storage-note">
        本地草稿自动保存到 localStorage。导入与导出均在浏览器内完成；此工具不是云端 CMS，也不会直接发布课程。
      </p>
    </section>
  );
}
