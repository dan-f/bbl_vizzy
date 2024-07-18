export type Color = [number, number, number];

export type Palette = {
  lineColor: Color;
  textColor: Color;
  focusColor: Color;
  vizzyForeground: Color;
  vizzyBackground: Color;
};

export enum PaletteOption {
  Classic = "CLASSIC",
  Dirt = "DIRT",
  Heat = "HEAT",
  Mono = "MONO",
}

const PaletteDefs: { [key in PaletteOption]: Palette } = {
  [PaletteOption.Classic]: {
    vizzyBackground: [15, 56, 15],
    vizzyForeground: [125, 140, 15],
    lineColor: [202, 67, 80],
    textColor: [35, 133, 236],
    focusColor: [202, 67, 80],
  },

  [PaletteOption.Dirt]: {
    vizzyBackground: [27, 10, 9],
    vizzyForeground: [171, 116, 9],
    lineColor: [213, 94, 7],
    textColor: [255, 201, 132],
    focusColor: [122, 65, 247],
  },

  [PaletteOption.Heat]: {
    vizzyBackground: [40, 0, 180],
    vizzyForeground: [150, 30, 20],
    lineColor: [81, 20, 141],
    textColor: [243, 164, 13],
    focusColor: [202, 67, 80],
  },

  [PaletteOption.Mono]: {
    vizzyBackground: [20, 20, 20],
    vizzyForeground: [80, 80, 80],
    lineColor: [100, 100, 100],
    textColor: [230, 230, 230],
    focusColor: [236, 243, 24],
  },
};

export function getPalette(option: PaletteOption): Palette {
  return PaletteDefs[option];
}

export function serialize(c: Color): string {
  return `rgb(${c.join(", ")})`;
}

export function lerp(a: Color, b: Color, t: number): Color {
  return a.map((val, i) => Math.floor(_lerp(val, b[i], t))) as Color;
}

function _lerp(a: number, b: number, t: number): number {
  return (1 - t) * a + t * b;
}
