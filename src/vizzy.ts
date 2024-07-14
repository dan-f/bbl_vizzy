export class Vizzy {
  analyser: AnalyserNode;
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  pixelSize: number;

  constructor(analyser: AnalyserNode, canvas: HTMLCanvasElement) {
    this.analyser = analyser;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);

    this.canvas = canvas;
    this.canvasContext = this.canvas.getContext("2d")!;

    this.pixelSize = 10;

    this._updateCanvasDimensions = this._updateCanvasDimensions.bind(this);
    window.addEventListener("resize", this._updateCanvasDimensions);
    this._updateCanvasDimensions();

    this.draw = this.draw.bind(this);
    this.draw();
  }

  draw() {
    this.canvasContext.fillStyle = "greenyellow";
    this.canvasContext.fillRect(0, 0, this.w, this.h);
    this.analyser.getByteTimeDomainData(this.timeData);
    const len = this.timeData.length;
    for (let i = 0; i < this.timeData.length; i++) {
      const x = (this.w * i) / len;
      const y = this.h / 2 - (2 * (this.timeData[i] / 255) - 1) * (this.h / 2);
      this.canvasContext.fillStyle = "fuchsia";
      this.canvasContext.fillRect(
        x - this.pixelSize / 2,
        y - this.pixelSize / 2,
        this.pixelSize,
        this.pixelSize,
      );
    }

    window.requestAnimationFrame(this.draw);
  }

  get w(): number {
    return this.canvas.clientWidth;
  }

  get h(): number {
    return this.canvas.clientHeight;
  }

  _updateCanvasDimensions() {
    this.canvas.width = this.w;
    this.canvas.height = this.h;
  }
}
