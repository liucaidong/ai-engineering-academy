export type MergeRule = readonly [left: string, right: string];
export type MergeStep = { left: string; right: string; merged: string; rank: number };
export type BpeResult = { tokens: string[]; steps: MergeStep[] };

export const TOY_MERGES: readonly MergeRule[] = [
  ["t", "h"],
  ["th", "e"],
  ["e", "r"],
  ["i", "n"],
  ["in", "g"],
  ["a", "n"],
  ["an", "d"],
  ["l", "o"],
  ["lo", "w"]
];

/**
 * Educational byte-pair-encoding demonstration using a deliberately tiny,
 * hand-authored merge table. This is NOT a production tokenizer and does not
 * reproduce any vendor/model vocabulary or token IDs.
 */
export function encodeWithToyBpe(input: string, rules: readonly MergeRule[] = TOY_MERGES): BpeResult {
  const rank = new Map(rules.map(([left, right], index) => [`${left}\u0000${right}`, index]));
  const tokens: string[] = [];
  const steps: MergeStep[] = [];

  for (const segment of input.match(/\s+|[^\s]+/gu) ?? []) {
    if (/^\s+$/u.test(segment)) {
      tokens.push(segment);
      continue;
    }

    let pieces = Array.from(segment.toLowerCase());
    while (pieces.length > 1) {
      let bestIndex = -1;
      let bestRank = Number.POSITIVE_INFINITY;

      for (let index = 0; index < pieces.length - 1; index += 1) {
        const candidateRank = rank.get(`${pieces[index]}\u0000${pieces[index + 1]}`);
        if (candidateRank !== undefined && candidateRank < bestRank) {
          bestRank = candidateRank;
          bestIndex = index;
        }
      }

      if (bestIndex < 0) break;
      const left = pieces[bestIndex];
      const right = pieces[bestIndex + 1];
      const merged = left + right;
      steps.push({ left, right, merged, rank: bestRank });
      pieces.splice(bestIndex, 2, merged);
    }
    tokens.push(...pieces);
  }

  return { tokens, steps };
}
