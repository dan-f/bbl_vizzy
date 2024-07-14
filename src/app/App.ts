import { createAudioGraph } from "../audio-graph";
import { ByteBeat, validateProgram } from "../byte-beat";
import { StateManager } from "../lib";
import { Vizzy } from "../Vizzy";
import { AppElements } from "./AppElements";
import {
  AppState,
  evalProgram,
  initialState,
  togglePlaying,
  updateBitDepth,
  updateSampleRate,
} from "./AppState";
import { ConsoleLogger } from "./ConsoleLogger";

export class App {
  private stateMgr: StateManager<AppState>;
  private byteBeat: ByteBeat;
  private vizzy: Vizzy;
  private elements: AppElements;
  private log = new ConsoleLogger("App");

  constructor(byteBeat: ByteBeat, vizzy: Vizzy, elements: AppElements) {
    this.stateMgr = new StateManager(initialState, this.log);
    this.byteBeat = byteBeat;
    this.vizzy = vizzy;
    this.elements = elements;
  }

  bootstrap() {
    this.applyState(this.stateMgr.state, true);
    this.stateMgr.subscribe(({ state }) => this.applyState(state));
    this.listenForEvents();
  }

  private applyState(state: Partial<AppState>, initial: boolean = false) {
    this.updateBb(state, initial);
    this.updateUi(state);
  }

  private updateBb(state: Partial<AppState>, initial: boolean = false) {
    if (!initial && state.program != null) {
      this.byteBeat.evalProgram(state.program);
    }

    if (!initial && state.playing != null) {
      this.byteBeat.setPlaying(state.playing);
    }

    if (state.gain != null) {
      this.byteBeat.setGain(state.gain);
    }

    if (state.bitDepth != null) {
      this.byteBeat.setBitDepth(state.bitDepth);
    }

    if (state.sampleRate != null) {
      this.byteBeat.setSampleRate(state.sampleRate);
    }
  }

  private updateUi(state: Partial<AppState>) {
    if (state.playing != null) {
      this.elements.playstateToggle.innerText = state.playing
        ? "pause"
        : "play";
    }

    if (state.bitDepth != null) {
      const bdInput = this.elements.bitDepth.find(
        ([val, _]) => val === state.bitDepth,
      )?.[1];
      if (bdInput) {
        bdInput.checked = true;
      }
    }

    if (state.sampleRate != null) {
      const srInput = this.elements.sampleRate.find(
        ([val, _]) => val === state.sampleRate,
      )?.[1];
      if (srInput) {
        srInput.checked = true;
      }
    }
  }

  private listenForEvents() {
    const { programEditor, evalButton } = this.elements;

    if (programEditor.value.trim().length === 0) {
      evalButton.disabled = true;
    } else {
      evalButton.disabled = false;
    }

    programEditor.addEventListener("input", () => {
      if (programEditor.value.trim().length === 0 && !evalButton.disabled) {
        evalButton.disabled = true;
      } else if (programEditor.value.trim().length > 0 && evalButton.disabled) {
        evalButton.disabled = false;
      }
    });

    window.onkeydown = (event) => {
      if (event.code === "Space" && event.target === document.body) {
        this.stateMgr.transition(togglePlaying);
      }
    };

    this.elements.playstateToggle.onclick = (event) => {
      event.preventDefault();
      this.stateMgr.transition(togglePlaying);
    };

    this.elements.programForm.onsubmit = (event) => {
      event.preventDefault();
      const raw = this.elements.programEditor.value;
      try {
        this.stateMgr.transition(evalProgram(validateProgram(raw)));
      } catch (_error) {
        alert("TODO better error handling UI");
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
          this.stateMgr.transition(updateBitDepth(parseInt(input.value)));
        }
      };
    }

    for (const [_, input] of this.elements.sampleRate) {
      input.onchange = () => {
        if (input.checked) {
          this.stateMgr.transition(updateSampleRate(parseInt(input.value)));
        }
      };
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
