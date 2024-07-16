const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function b64Encode(s: string): string {
  const utf8Encoded = encoder.encode(s);
  const binString = Array.from(utf8Encoded, (byte) =>
    String.fromCodePoint(byte),
  ).join("");
  return btoa(binString);
}

export function b64Decode(b64: string): string {
  const binString = atob(b64);
  return decoder.decode(Uint8Array.from(binString, (m) => m.codePointAt(0)!));
}
