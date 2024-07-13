import { ByteBeat } from "./ByteBeat.js";
import { Vizzy } from "./vizzy.js";

const AudioContext = window.AudioContext || webkitAudioContext;

export class App {
  constructor(byteBeat, vizzy, elements) {
    this.byteBeat = byteBeat;
    this.vizzy = vizzy;
    this.elements = elements;
  }

  bootstrap() {
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
        programForm.requestSubmit();
      }
    };
  }

  static async create(elements) {
    const audioCtx = new AudioContext();
    const { bbNode, analyserNode, gainNode } = await this.createAudioGraph(
      audioCtx
    );

    const byteBeat = new ByteBeat(audioCtx, bbNode, gainNode);
    const vizzy = new Vizzy(analyserNode, elements.vizzyCanvas);

    return new App(byteBeat, vizzy, elements);
  }

  static async createAudioGraph(audioCtx) {
    await audioCtx.audioWorklet.addModule("static/bb.processor.js");

    const bbNode = new AudioWorkletNode(audioCtx, "BbProcessor");
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2 ** 13;

    bbNode.connect(gainNode);
    bbNode.connect(analyserNode);
    gainNode.connect(audioCtx.destination);

    return { bbNode, analyserNode, gainNode };
  }
}
