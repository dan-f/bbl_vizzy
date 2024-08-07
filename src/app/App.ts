import { createAudioGraph } from "../audio-graph";
import { ByteBeat, validateProgram } from "../byte-beat";
import { b64Decode, b64Encode, StateManager } from "../lib";
import { Vizzy } from "../vizzy";
import { getPalette, Palette, PaletteOption, serialize } from "../vizzy/Color";
import { AppElements } from "./AppElements";
import {
  AppState,
  evalProgram,
  getShareState,
  InitialState,
  mergeShareState,
  ShareState,
  togglePlaying,
  updateAnimationType,
  updateBitDepth,
  updatePalette,
  updateSampleRate,
} from "./AppState";
import { ConsoleLogger } from "./ConsoleLogger";
import { Modal } from "./Modal";

const log = new ConsoleLogger("App");

export class App {
  private stateMgr: StateManager<AppState>;
  private byteBeat: ByteBeat;
  private vizzy: Vizzy;
  private modal: Modal;
  private elements: AppElements;

  constructor(byteBeat: ByteBeat, vizzy: Vizzy, elements: AppElements) {
    this.stateMgr = new StateManager(App.getInitialState(), log);
    this.byteBeat = byteBeat;
    this.vizzy = vizzy;
    this.modal = new Modal(elements.modal);
    this.elements = elements;
  }

  bootstrap() {
    this.handleStateTransition = this.handleStateTransition.bind(this);
    this.handleStateTransition(this.state, this.state);
    this.stateMgr.subscribe(({ state, updated }) =>
      this.handleStateTransition(state, updated),
    );
    this.listenForEvents();
  }

  private handleStateTransition(state: AppState, updated: Partial<AppState>) {
    this.updateBb(state, updated);
    this.updateVizzy(state, updated);
    this.updateUi(state, updated);
  }

  private updateBb(state: AppState, updated: Partial<AppState>) {
    if ("program" in updated) {
      this.byteBeat.evalProgram(state.program!);
    }

    if ("playing" in updated) {
      this.byteBeat.setPlaying(state.playing);
      this.vizzy.setPlaying(state.playing);
    }

    if ("gain" in updated) {
      this.byteBeat.setGain(state.gain);
    }

    if ("bitDepth" in updated) {
      this.byteBeat.setBitDepth(state.bitDepth);
    }

    if ("sampleRate" in updated) {
      this.byteBeat.setSampleRate(state.sampleRate);
    }
  }

  private updateVizzy(state: AppState, updated: Partial<AppState>) {
    if ("animationType" in updated) {
      this.vizzy.setAnimationType(state.animationType);
    }
    if ("palette" in updated) {
      this.vizzy.setPalette(state.palette);
      this.updateCssFromPalette(state.palette);
    }
  }

  private updateUi(state: AppState, updated: Partial<AppState>) {
    const shareState = getShareState(state);
    if (shareState) {
      log.debug("Updating hash fragment with share state", shareState);
      history.replaceState(
        null,
        "",
        location.pathname + `#${App.encodeShareState(shareState)}`,
      );
    }

    if ("program" in updated) {
      this.elements.programEditor.value = state.program!.programText;
    }

    if ("playing" in updated) {
      this.elements.playstateToggle.innerText = state.playing
        ? "pause"
        : "play";
    }

    this.elements.playstateToggle.disabled = state.program == null;

    if ("animationType" in updated) {
      const animationTypeInput = this.elements.animationType.find(
        ([val, _]) => val === state.animationType,
      )?.[1];
      if (animationTypeInput) {
        animationTypeInput.checked = true;
      }
    }

    if ("palette" in updated) {
      const paletteInput = this.elements.palette.find(
        ([val, _]) => val === state.palette,
      )?.[1];
      if (paletteInput) {
        paletteInput.checked = true;
      }
    }

    if ("bitDepth" in updated) {
      const bdInput = this.elements.bitDepth.find(
        ([val, _]) => val === state.bitDepth,
      )?.[1];
      if (bdInput) {
        bdInput.checked = true;
      }
    }

    if (updated.sampleRate) {
      const srInput = this.elements.sampleRate.find(
        ([val, _]) => val === state.sampleRate,
      )?.[1];
      if (srInput) {
        srInput.checked = true;
      }
    }
  }

  private listenForEvents() {
    const { programEditor, evalButton, playstateToggle } = this.elements;
    const { program } = this.state;

    window.addEventListener("hashchange", console.log);

    evalButton.disabled = programEditor.value.trim().length === 0;
    playstateToggle.disabled = program == null;

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
      const validated = validateProgram(raw);
      if (!validated) {
        this.modal.open("Whoops! Invalid program.");
        return;
      }
      this.stateMgr.transition(evalProgram(validated));
    };

    this.elements.programEditor.onkeydown = (event) => {
      if (event.code === "Enter" && (event.ctrlKey || event.metaKey)) {
        this.elements.programForm.requestSubmit();
      }
    };

    for (const [_, input] of this.elements.animationType) {
      input.onchange = () => {
        if (input.checked) {
          this.stateMgr.transition(updateAnimationType(input.value));
        }
      };
    }

    for (const [_, input] of this.elements.palette) {
      input.onchange = () => {
        if (input.checked) {
          this.stateMgr.transition(updatePalette(input.value));
        }
      };
    }

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

    this.elements.shareButton.onclick = () => {
      navigator.clipboard
        .writeText(window.location.toString())
        .then(() => this.modal.open("Copied URL for this program!"));
    };
  }

  private get state(): AppState {
    return this.stateMgr.state;
  }

  private static getInitialState(): AppState {
    const hash = window.location.hash.substring(1);
    if (!hash) {
      return InitialState;
    }

    const shareState = this.decodeShareState(hash);
    log.debug("Hydrating from hash fragment with share state", shareState);
    return mergeShareState(shareState)(InitialState);
  }

  private static encodeShareState(shareState: ShareState): string {
    return b64Encode(JSON.stringify(shareState));
  }

  private static decodeShareState(encoded: string): ShareState {
    return JSON.parse(b64Decode(encoded));
  }

  static async create(elements: AppElements): Promise<App> {
    const audioCtx = new AudioContext();
    const { bbNode, analyserNode, gainNode } = await createAudioGraph(audioCtx);

    const byteBeat = new ByteBeat(audioCtx, bbNode, gainNode);
    const vizzy = new Vizzy(analyserNode, elements.vizzyCanvas);

    return new App(byteBeat, vizzy, elements);
  }

  private updateCssFromPalette(palette: PaletteOption): void {
    const paletteData: Palette = getPalette(palette);
    this.elements.root.style.setProperty(
      "--type",
      serialize(paletteData.textColor),
    );
    this.elements.root.style.setProperty(
      "--border",
      serialize(paletteData.lineColor),
    );
    this.elements.root.style.setProperty(
      "--focus",
      serialize(paletteData.focusColor),
    );
  }
}
