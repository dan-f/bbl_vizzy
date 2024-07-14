export interface AppElements {
  programForm: HTMLFormElement;
  programEditor: HTMLTextAreaElement;
  evalButton: HTMLInputElement;
  playstateToggle: HTMLButtonElement;
  bitDepth: [number, HTMLInputElement][];
  sampleRate: [number, HTMLInputElement][];
  vizzyCanvas: HTMLCanvasElement;
}
