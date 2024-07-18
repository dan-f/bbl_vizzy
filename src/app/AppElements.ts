export interface AppElements {
  programForm: HTMLFormElement;
  programEditor: HTMLTextAreaElement;
  evalButton: HTMLInputElement;
  playstateToggle: HTMLButtonElement;
  animationType: [string, HTMLInputElement][];
  palette: [string, HTMLInputElement][];
  bitDepth: [number, HTMLInputElement][];
  sampleRate: [number, HTMLInputElement][];
  vizzyCanvas: HTMLCanvasElement;
  shareButton: HTMLButtonElement;
  modal: {
    dialog: HTMLDialogElement;
    msg: HTMLElement;
    close: HTMLElement;
  };
  root: HTMLElement;
}
