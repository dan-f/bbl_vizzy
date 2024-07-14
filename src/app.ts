import { createAudioGraph } from "./audio-graph";
import { ByteBeat } from "./byte-beat";
import { Vizzy } from "./Vizzy";

export interface AppElements {
  programForm: HTMLFormElement;
  programEditor: HTMLTextAreaElement;
  playstateToggle: HTMLButtonElement;
  vizzyCanvas: HTMLCanvasElement;
}

export class App {
  byteBeat: ByteBeat;
  vizzy: Vizzy;
  elements: AppElements;

  constructor(byteBeat: ByteBeat, vizzy: Vizzy, elements: AppElements) {
    this.byteBeat = byteBeat;
    this.vizzy = vizzy;
    this.elements = elements;

    this._updatePlaystateToggleText =
      this._updatePlaystateToggleText.bind(this);
  }

  bootstrap() {
    this._updatePlaystateToggleText(this.byteBeat.playing);
    this.byteBeat.subscribeToPlaystate(this._updatePlaystateToggleText);

    window.onkeydown = (event) => {
      if (event.code === "Space" && event.target === document.body) {
        this.byteBeat.togglePlaying();
      }
    };

    this.elements.playstateToggle.onclick = () => {
      this.byteBeat.togglePlaying();
    };

    this.elements.programForm.onsubmit = (event) => {
      event.preventDefault();
      const programText = this.elements.programEditor.value;
      this.byteBeat.setProgram(programText);
      if (!this.byteBeat.playing) {
        this.byteBeat.togglePlaying();
      }
    };

    this.elements.programEditor.onkeydown = (event) => {
      if (event.code === "Enter" && (event.ctrlKey || event.metaKey)) {
        this.elements.programForm.requestSubmit();
      }
    };
  }

  _updatePlaystateToggleText(playing: boolean) {
    this.elements.playstateToggle.innerText = playing ? "pause" : "play";
  }

  static async create(elements: AppElements): Promise<App> {
    const audioCtx = new AudioContext();
    const { bbNode, analyserNode, gainNode } = await createAudioGraph(audioCtx);

    const byteBeat = new ByteBeat(audioCtx, bbNode, gainNode);
    const vizzy = new Vizzy(analyserNode, elements.vizzyCanvas);

    return new App(byteBeat, vizzy, elements);
  }
}
