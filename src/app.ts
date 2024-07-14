import { createAudioGraph } from "./audio-graph";
import { ByteBeat, State as ByteBeatState } from "./byte-beat";
import { Vizzy } from "./Vizzy";

export interface AppElements {
  programForm: HTMLFormElement;
  programEditor: HTMLTextAreaElement;
  playstateToggle: HTMLButtonElement;
  bitDepth: [number, HTMLInputElement][];
  sampleRate: [number, HTMLInputElement][];
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
  }

  bootstrap() {
    this._updateUi(this.byteBeat.state);
    this.byteBeat.subscribeToStateChange(({ state }) => this._updateUi(state));

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
      this.byteBeat.evalProgram(programText);
      if (!this.byteBeat.state.playing) {
        this.byteBeat.togglePlaying();
      }
    };

    this.elements.programEditor.onkeydown = (event) => {
      if (event.code === "Enter" && (event.ctrlKey || event.metaKey)) {
        this.elements.programForm.requestSubmit();
      }
    };

    for (const [_, input] of this.elements.bitDepth) {
      input.onchange = () => {
        if (input.checked) {
          this.byteBeat.setBitDepth(parseInt(input.value));
        }
      };
    }

    for (const [_, input] of this.elements.sampleRate) {
      input.onchange = () => {
        if (input.checked) {
          this.byteBeat.setSampleRate(parseInt(input.value));
        }
      };
    }
  }

  _updateUi(state: ByteBeatState) {
    this.elements.programEditor.innerText = state.programText;
    this.elements.playstateToggle.innerText = state.playing ? "pause" : "play";

    const bdInput = this.elements.bitDepth.find(
      ([val, _]) => val === state.bitDepth,
    )?.[1];
    if (bdInput) {
      bdInput.checked = true;
    }

    const srInput = this.elements.sampleRate.find(
      ([val, _]) => val === state.sampleRate,
    )?.[1];
    if (srInput) {
      srInput.checked = true;
    }
  }

  static async create(elements: AppElements): Promise<App> {
    const audioCtx = new AudioContext();
    const { bbNode, analyserNode, gainNode } = await createAudioGraph(audioCtx);

    const byteBeat = new ByteBeat(audioCtx, bbNode, gainNode);
    const vizzy = new Vizzy(analyserNode, elements.vizzyCanvas);

    return new App(byteBeat, vizzy, elements);
  }
}
