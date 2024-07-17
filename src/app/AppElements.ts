export interface AppElements {
  programForm: HTMLFormElement;
  programEditor: HTMLTextAreaElement;
  evalButton: HTMLInputElement;
  playstateToggle: HTMLButtonElement;
  bitDepth: [number, HTMLInputElement][];
  sampleRate: [number, HTMLInputElement][];
  vizzyCanvas: HTMLCanvasElement;
  shareButton: HTMLButtonElement;
  modal: {
    dialog: HTMLDialogElement;
    msg: HTMLElement;
    close: HTMLElement;
  };
}
