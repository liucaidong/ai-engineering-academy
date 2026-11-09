export type EvaluationCase = { id: string; prompt: string; expected: string; actual: string };
export type EvaluationResult = { id: string; passed: boolean; expected: string; actual: string };

export function evaluateTeachingDataset(cases: EvaluationCase[]): {
  total: number;
  passed: number;
  accuracy: number;
  results: EvaluationResult[];
} {
  const results = cases.map((item) => ({
    id: item.id,
    passed: item.expected.trim().toLocaleLowerCase() === item.actual.trim().toLocaleLowerCase(),
    expected: item.expected,
    actual: item.actual,
  }));
  const passed = results.filter((item) => item.passed).length;
  return {
    total: results.length,
    passed,
    accuracy: results.length ? passed / results.length : 0,
    results,
  };
}
