// const palette = ["#8bac0f", "#9bbc0f", "#306230", "#0f380f", "#0f380f"];

import {
  Color,
  getPalette,
  lerp,
  Palette,
  PaletteOption,
  serialize,
} from "./Color";

export enum AnimationType {
  Time = "TIME",
  Freq = "FREQ",
}

export class Vizzy {
  analyser: AnalyserNode;
  frequencyData: Uint8Array;
  timeData: Uint8Array;

  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  animationType = AnimationType.Time;
  playing = false;
  palette = Vizzy.createPaletteGradient(getPalette(PaletteOption.Classic), 16);
  pixelSize = 1;
  frame = 0;

  constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement) {
    this.analyser = analyser;
    this.analyser.fftSize = 512;

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);

    this.canvas = canvas;
    this.canvas.height = this.analyser.frequencyBinCount;
    this.canvas.width = this.canvas.height;
    this.canvasContext = this.canvas.getContext("2d")!;

    this.draw = this.draw.bind(this);
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
    this.draw();
  }

  setAnimationType(animationType: AnimationType) {
    this.animationType = animationType;
  }

  setPalette(paletteName: PaletteOption) {
    this.canvasContext.fillStyle = "#000000aa";
    this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.palette = Vizzy.createPaletteGradient(getPalette(paletteName), 16);
  }

  private draw(): void {
    switch (this.animationType) {
      case AnimationType.Time:
        this.drawTime();
        break;
      case AnimationType.Freq:
        this.drawFrequency();
        break;
    }
    this.frame = (this.frame + 1) % this.canvas.width;
    if (this.playing) {
      window.requestAnimationFrame(this.draw);
    }
  }

  private drawFrequency() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    const samples = this.frequencyData.length;
    for (let i = 0; i < samples; i++) {
      const sample = Math.pow(this.frequencyData[i] / 256, 2);
      const ndx = Math.floor(this.palette.length * sample);
      const color = this.palette[ndx];
      const y = (this.canvas.height * i) / samples;
      const x = (this.canvas.width * this.frame) / samples;
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(x, y, this.pixelSize, this.pixelSize);
    }
  }

  private drawTime() {
    this.analyser.getByteTimeDomainData(this.timeData);
    const samples = this.timeData.length;
    for (let i = 0; i < samples; i++) {
      const sample = this.timeData[i];
      const ndx = Math.floor((this.palette.length * sample) / 256);
      const color = this.palette[ndx];
      const y = (this.canvas.height * i) / samples;
      const x = (2 * (this.canvas.width * this.frame)) / samples;
      this.canvasContext.fillStyle = color;
      this.canvasContext.fillRect(x, y, this.pixelSize, this.pixelSize);
    }
  }

  public static createPaletteGradient(
    palette: Palette,
    _depth: number = 16,
  ): string[] {
    const background: Color = palette.vizzyBackground;
    const foreground: Color = palette.vizzyForeground;

    const colorArray = [];
    for (let i = 0; i < _depth; i++) {
      const color = lerp(background, foreground, i / (_depth - 1));
      colorArray.push(serialize(color));
    }

    return colorArray;
  }
}
