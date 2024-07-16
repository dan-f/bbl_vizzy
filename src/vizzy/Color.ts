export type Color = [number, number, number];

export function serialize(c: Color): string {
  return `rgb(${c.join(", ")})`;
}

export function lerp(a: Color, b: Color, t: number): Color {
  return a.map((val, i) => Math.floor(_lerp(val, b[i], t))) as Color;
}

function _lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}
