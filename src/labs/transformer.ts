export type Matrix = number[][];
export type AttentionResult = { scores: Matrix; weights: Matrix; output: Matrix };

export function transpose(matrix: Matrix): Matrix {
  if (!matrix.length || matrix.some((row) => row.length !== matrix[0].length)) throw new Error("Matrix must be non-empty and rectangular");
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

export function softmax(values: number[]): number[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  const exponents = values.map((value) => Math.exp(value - max));
  const sum = exponents.reduce((total, value) => total + value, 0);
  return exponents.map((value) => value / sum);
}

export function scaledDotProductAttention(query: Matrix, key: Matrix, value: Matrix, mask?: boolean[][]): AttentionResult {
  const keyT = transpose(key);
  const depth = query[0]?.length ?? 0;
  if (!depth || keyT.length !== depth || value.length !== key.length) throw new Error("Q, K and V dimensions are incompatible");
  const scores = query.map((q) => keyT[0].map((_, column) => q.reduce((sum, item, index) => sum + item * keyT[index][column], 0) / Math.sqrt(depth)));
  if (mask && (mask.length !== scores.length || mask.some((row) => row.length !== key.length))) throw new Error("Mask dimensions do not match attention scores");
  const weights = scores.map((row, rowIndex) => softmax(row.map((score, column) => mask?.[rowIndex]?.[column] === false ? Number.NEGATIVE_INFINITY : score)));
  const output = weights.map((row) => value[0].map((_, column) => row.reduce((sum, weight, index) => sum + weight * value[index][column], 0)));
  return { scores, weights, output };
}
