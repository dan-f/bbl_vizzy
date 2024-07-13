import { App } from "./app.js";

(async () => {
  const elements = {
    programForm: document.getElementById("program-form"),
    programEditor: document.getElementById("program-editor"),
    togglePlaystate: document.getElementById("ctrl-toggle-playstate"),
    vizzyCanvas: document.getElementById("vizzy"),
  };

  const app = await App.create(elements);
  app.bootstrap();
})();
