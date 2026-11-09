export type Matrix = number[][];
export type AttentionResult = { scores: Matrix; weights: Matrix; output: Matrix };

export function transpose(matrix: Matrix): Matrix {
  if (!matrix.length || matrix.some((row) => row.length !== matrix[0].length))
    throw new Error("Matrix must be non-empty and rectangular");
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

export function softmax(values: number[]): number[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  if (!Number.isFinite(max)) return values.map(() => 0);
  const exponents = values.map((value) => Math.exp(value - max));
  const sum = exponents.reduce((total, value) => total + value, 0);
  return sum === 0 ? values.map(() => 0) : exponents.map((value) => value / sum);
}

export function scaledDotProductAttention(
  query: Matrix,
  key: Matrix,
  value: Matrix,
  mask?: boolean[][],
): AttentionResult {
  const keyT = transpose(key);
  const valueT = transpose(value);
  const depth = query[0]?.length ?? 0;
  if (
    !depth ||
    keyT.length !== depth ||
    value.length !== key.length ||
    query.some((row) => row.length !== depth)
  )
    throw new Error("Q, K and V dimensions are incompatible");
  if (mask && (mask.length !== query.length || mask.some((row) => row.length !== key.length)))
    throw new Error("Mask dimensions do not match attention scores");
  const scores = query.map((q) =>
    keyT[0].map(
      (_, column) =>
        q.reduce((sum, item, index) => sum + item * keyT[index][column], 0) / Math.sqrt(depth),
    ),
  );
  const weights = scores.map((row, rowIndex) =>
    softmax(
      row.map((score, column) =>
        mask?.[rowIndex]?.[column] === false ? Number.NEGATIVE_INFINITY : score,
      ),
    ),
  );
  const output = weights.map((row) =>
    valueT.map((valueRow) =>
      valueRow.reduce((sum, valueItem, index) => sum + valueItem * row[index], 0),
    ),
  );
  return { scores, weights, output };
}
