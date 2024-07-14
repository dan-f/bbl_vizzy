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
  };

  const app = await App.create(elements);
  app.bootstrap();
})();
