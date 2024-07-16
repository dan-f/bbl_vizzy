// const palette = ["#8bac0f", "#9bbc0f", "#306230", "#0f380f", "#0f380f"];

import { Color, lerp, serialize } from "./Color";

export class Vizzy {
  analyser: AnalyserNode;
  frequencyData: Uint8Array;
  timeData: Uint8Array;

  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  playing = false;
  palette = Vizzy.buildPalette();
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

  private draw(): void {
    this.drawTime();
    this.frame = (this.frame + 1) % this.canvas.width;
    if (this.playing) {
      window.requestAnimationFrame(this.draw);
    }
  }

  private drawFrequency() {
    this.analyser.getByteFrequencyData(this.frequencyData);
    const samples = this.frequencyData.length;
    for (let i = 0; i < samples; i++) {
      const sample = this.frequencyData[i];
      const ndx = Math.floor((this.palette.length * sample) / 256);
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

  private static buildPalette(): string[] {
    // const dark: Color = [15, 56, 15];
    // const light: Color = [155, 188, 15];
    const dark: Color = [10, 10, 10];
    const light: Color = [200, 50, 200];

    const palette: string[] = [];
    for (let i = 0; i < 16; i++) {
      const color = lerp(dark, light, i / 15);
      palette.push(serialize(color));
    }

    return palette;
  }
}
