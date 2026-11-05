export type DocumentChunk = { id: string; text: string; vector: number[]; source: string };
export type SearchResult = DocumentChunk & { score: number; rerankScore: number };

export function chunkText(text: string, chunkSize = 72, overlap = 12): string[] {
  if (!Number.isInteger(chunkSize) || chunkSize < 1 || !Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) throw new Error("Require chunkSize > overlap >= 0");
  const normalized = text.trim().replace(/\s+/gu, " ");
  if (!normalized) return [];
  const chunks: string[] = [];
  for (let start = 0; start < normalized.length; start += chunkSize - overlap) {
    chunks.push(normalized.slice(start, start + chunkSize));
    if (start + chunkSize >= normalized.length) break;
  }
  return chunks;
}

function toyEmbedding(text: string, dimensions = 12): number[] {
  const vector = Array.from({ length: dimensions }, () => 0);
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    vector[(code * 7 + index * 13) % dimensions] += ((code % 17) + 1) / 18;
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

function cosineSimilarity(left: number[], right: number[]): number {
  if (left.length !== right.length) throw new Error("Embedding dimensions must match");
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

export function retrieveToy(query: string, documents: Array<{ id: string; text: string; source: string }>, topK = 3): SearchResult[] {
  if (!Number.isInteger(topK) || topK < 1) throw new Error("topK must be a positive integer");
  const queryVector = toyEmbedding(query);
  const queryTerms = new Set(query.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
  return documents.map((document) => {
    const vector = toyEmbedding(document.text);
    const score = cosineSimilarity(queryVector, vector);
    const textTerms = new Set(document.text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean));
    const overlap = [...queryTerms].filter((term) => textTerms.has(term)).length;
    return { ...document, vector, score, rerankScore: score + overlap * 0.08 };
  }).sort((a, b) => b.rerankScore - a.rerankScore).slice(0, topK);
}
