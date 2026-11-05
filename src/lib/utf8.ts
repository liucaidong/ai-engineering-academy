export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

export function isWithinUtf8ByteLimit(value: string, maxBytes: number): boolean {
  return Number.isSafeInteger(maxBytes) && maxBytes >= 0 && utf8ByteLength(value) <= maxBytes;
}
