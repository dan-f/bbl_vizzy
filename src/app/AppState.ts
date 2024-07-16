import { ValidatedProgram } from "../byte-beat";

export interface AppState {
  program?: ValidatedProgram;
  playing: boolean;
  gain: number;
  bitDepth: number;
  sampleRate: number;
}

export interface ShareState {
  v: 1;
  program: ValidatedProgram;
  bitDepth: number;
  sampleRate: number;
}

const ShareStateVersion = 1;

export const InitialState: AppState = {
  playing: false,
  gain: 0.15,
  bitDepth: 8,
  sampleRate: 8000,
};

export function getShareState(state: AppState): ShareState | undefined {
  if (!state.program) {
    return;
  }
  const { program, bitDepth, sampleRate } = state;
  return { v: 1, program, bitDepth, sampleRate };
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
    if (
      program.programText === state.program?.programText &&
      program.fnText === state.program?.fnText &&
      state.playing
    ) {
      return state;
    }

    return { ...state, program, playing: true };
  };

export const mergeShareState =
  (incomingState: ShareState) => (state: AppState) => {
    if (incomingState.v !== ShareStateVersion) {
      return state;
    }
    const { program, bitDepth, sampleRate } = incomingState;
    return { ...state, program, bitDepth, sampleRate };
  };

export const updateGain = mkUpdateField("gain");
export const updateBitDepth = mkUpdateField("bitDepth");
export const updateSampleRate = mkUpdateField("sampleRate");
