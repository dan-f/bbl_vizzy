import { ValidatedProgram } from "../byte-beat";
import { AnimationType } from "../vizzy";
import { PaletteOption } from "../vizzy/Color";

export interface AppState {
  program?: ValidatedProgram;
  playing: boolean;
  gain: number;
  bitDepth: number;
  sampleRate: number;
  animationType: AnimationType;
  palette: PaletteOption;
}

export type ShareState = Pick<
  AppState,
  "bitDepth" | "sampleRate" | "animationType" | "palette"
> & { program: ValidatedProgram } & { v: 1 };

const ShareStateVersion = 1;

export const InitialState: AppState = {
  playing: false,
  gain: 0.15,
  bitDepth: 8,
  sampleRate: 8000,
  animationType: AnimationType.Time,
  palette: PaletteOption.Dirt,
};

export function getShareState(state: AppState): ShareState | undefined {
  if (!state.program) {
    return;
  }
  const { program, bitDepth, sampleRate, animationType, palette } = state;
  return { v: 1, program, bitDepth, sampleRate, animationType, palette };
}

const mkUpdateField =
  <K extends keyof AppState>(field: K) =>
  (value: AppState[K]) =>
  (state: AppState): AppState => {
    if (value === state[field]) {
      return state;
    }

    return { ...state, [field]: value };
  };

export function togglePlaying(state: AppState): AppState {
  if (state.program == null) {
    return state;
  }
  return { ...state, playing: !state.playing };
}

export const evalProgram =
  (program: ValidatedProgram) =>
  (state: AppState): AppState => {
    if (program.programText === state.program?.programText && state.playing) {
      return state;
    }

    return { ...state, program, playing: true };
  };

export const mergeShareState =
  (incomingState: ShareState) =>
  (state: AppState): AppState => {
    if (incomingState.v !== ShareStateVersion) {
      return state;
    }
    const { v, ...rest } = incomingState;
    return { ...state, ...rest };
  };

export const updateAnimationType =
  (animationType: string) =>
  (state: AppState): AppState => {
    const asEnum = animationType as AnimationType;
    if (!Object.values(AnimationType).includes(asEnum)) {
      return state;
    }
    return { ...state, animationType: asEnum };
  };

export const updatePalette =
  (palette: string) =>
  (state: AppState): AppState => {
    const asEnum = palette as PaletteOption;
    if (!Object.values(PaletteOption).includes(asEnum)) {
      return state;
    }
    return { ...state, palette: asEnum };
  };

export const updateGain = mkUpdateField("gain");
export const updateBitDepth = mkUpdateField("bitDepth");
export const updateSampleRate = mkUpdateField("sampleRate");
// export const updateAnimationType = mkUpdateField("animationType");
