/**
 * Note that this module cannot be imported directly by standard ES modules due
 * to the reference to `AudioWorkletProcessor`, which is only defined in the
 * `AudioWorkletGlobalScope`.
 */

const DEFAULT_BIT_DEPTH = 8;
const DEFAULT_SAMPLE_RATE = 10000;

class ByteBeatProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.globalSample = 0;
    this.currentSample = 0;
    this.counter = 0;
    this.fn = () => 0;

    this.port.onmessage = (event) => {
      this.processMessage(event.data);
    };
  }

  static get parameterDescriptors() {
    return [
      {
        name: "bitDepth",
        defaultValue: DEFAULT_BIT_DEPTH,
        minValue: 1,
        maxValue: 16,
        automationRate: "k-rate",
      },
      {
        name: "sampleRate",
        defaultValue: DEFAULT_SAMPLE_RATE,
        minValue: 1000,
        maxValue: 20000,
        automationRate: "k-rate",
      },
    ];
  }

  process(_inputs, outputs, parameters) {
    for (let s = 0; s < outputs[0][0].length; s++) {
      if (this.counter <= 0) {
        const t = this.globalSample;
        this.globalSample += 1;

        const bitDepth = parameters["bitDepth"][0] ?? DEFAULT_BIT_DEPTH;
        const sRate = parameters["sampleRate"][0] ?? DEFAULT_SAMPLE_RATE;

        const mask = (1 << bitDepth) - 1;
        let out = this.fn(t) & mask;
        out /= mask;
        out *= 2;
        out -= 1;
        this.currentSample = out;

        const remainder = 1.0 - this.counter;
        this.counter = sampleRate / sRate + remainder;
      }

      this.counter--;
      outputs[0][0][s] = this.currentSample;
    }

    return true;
  }

  processMessage(message) {
    switch (message.type) {
      case "UPDATE_FN": {
        // this.fn = eval(message.body);
        this.fn = new Function("t", `return ${message.body}`);
        break;
      }
    }
  }
}

registerProcessor("ByteBeatProcessor", ByteBeatProcessor);