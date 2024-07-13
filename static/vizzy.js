export class Vizzy {
  constructor(analyser, canvas) {
    this.analyser = analyser;
    this.canvas = canvas;

    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Uint8Array(this.analyser.fftSize);

    this.canvasContext = this.canvas.getContext("2d");

    this._boundDraw = this.draw.bind(this);
    this._boundDraw();

    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = this.w;
    this.canvas.height = this.h;

    this.pixelSize = 10;

    window.onresize = () => {
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
      this.canvas.width = this.w;
      this.canvas.height = this.h;
    };
  }

  get inlet() {
    return this.analyser;
  }

  connect(target) {
    this.analyser.connect(target);
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
        this.pixelSize
      );
    }

    window.requestAnimationFrame(this._boundDraw);
  }
}
