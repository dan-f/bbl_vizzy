import { App, AppElements } from "./app";

(async () => {
  const elements: AppElements = {
    programForm: document.getElementById("program-form")! as HTMLFormElement,
    programEditor: document.getElementById(
      "program-editor",
    )! as HTMLTextAreaElement,
    evalButton: document.getElementById("ctrl-eval")! as HTMLInputElement,
    playstateToggle: document.getElementById(
      "ctrl-toggle-playstate",
    )! as HTMLButtonElement,
    animationType: [
      ...(document.querySelectorAll(
        'input[name="animation-type"]',
      )! as NodeListOf<HTMLInputElement>),
    ].map((el) => [el.value, el]),
    palette: [
      ...(document.querySelectorAll(
        'input[name="palette"]',
      )! as NodeListOf<HTMLInputElement>),
    ].map((el) => [el.value, el]),
    vizzyCanvas: document.getElementById("vizzy")! as HTMLCanvasElement,
    bitDepth: [
      ...(document.querySelectorAll(
        'input[name="depth"]',
      )! as NodeListOf<HTMLInputElement>),
    ].map((el) => [parseInt(el.value), el]),
    sampleRate: [
      ...(document.querySelectorAll(
        'input[name="rate"]',
      )! as NodeListOf<HTMLInputElement>),
    ].map((el) => [parseInt(el.value), el]),
    shareButton: document.getElementById("share")! as HTMLButtonElement,
    modal: {
      dialog: document.getElementById("modal")! as HTMLDialogElement,
      msg: document.getElementById("modal-message")!,
      close: document.getElementById("modal-close")!,
    },
    root: document.body as HTMLElement,
  };

  const app = await App.create(elements);
  app.bootstrap();
})();
