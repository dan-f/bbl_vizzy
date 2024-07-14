import { App, AppElements } from "./app";

(async () => {
  const elements = {
    programForm: document.getElementById("program-form"),
    programEditor: document.getElementById("program-editor"),
    playstateToggle: document.getElementById("ctrl-toggle-playstate"),
    vizzyCanvas: document.getElementById("vizzy"),
  } as AppElements;

  const app = await App.create(elements);
  app.bootstrap();
})();
