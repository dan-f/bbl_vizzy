/**
 * Note that this module cannot be imported directly by standard ES modules due
 * to the reference to `AudioWorkletProcessor`, which is only defined in the
 * `AudioWorkletGlobalScope`.
 */

import { BbMessage, BbMessageType } from "./message";

class BbProcessor extends AudioWorkletProcessor {
  globalSample: number;
  cachedValue: number;
  counter: number;
  fn: (t: number) => number;

  constructor() {
    super();
    this.globalSample = 0;
    this.cachedValue = 0;
    this.counter = 0;
    this.fn = () => 0;

    this.port.onmessage = (event: MessageEvent<BbMessage>) => {
      this.processMessage(event.data);
    };
  }

  static get parameterDescriptors() {
    return [
      {
        name: "bitDepth",
        defaultValue: 0.75,
        minValue: 0, // 1
        maxValue: 1, // 16
        automationRate: "k-rate",
      },
      {
        name: "sampleRate",
        defaultValue: 0.75,
        minValue: 0, // 1000
        maxValue: 1, // 20000
        automationRate: "k-rate",
      },
    ];
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    for (let s = 0; s < outputs[0][0].length; s++) {
      if (this.counter <= 0) {
        const t = this.globalSample;
        this.globalSample += 1;

        const bdDefault = 8;
        const bdMin = 1;
        const bdMax = 16;
        const bdParam =
          parameters["bitDepth"][0] ?? (bdDefault - bdMin) / (bdMax - bdMin);
        const bitDepth = Math.trunc(bdParam * 15) + 1;

        const srDefault = 8000;
        const srMin = 1000;
        const srMax = 20000;
        const srParam =
          parameters["sampleRate"][0] ?? (srDefault - srMin) / (srMax - srMin);
        const sRate = srParam * 19000 + 1000;

        const mask = (1 << bitDepth) - 1;
        let out = this.fn(t) & mask;
        out /= mask;
        out *= 2;
        out -= 1;
        const remainder = 1.0 - this.counter;
        this.counter = sampleRate / sRate + remainder;
        this.cachedValue = out;
      }
      this.counter--;

      outputs[0][0][s] = Math.tanh(50 * this.cachedValue);
    }

    return true;
  }

  processMessage(message: BbMessage) {
    switch (message.type) {
      case BbMessageType.UpdateFn: {
        this.fn = eval(message.body);
        console.debug("updated fn", this.fn);
        break;
      }
    }
  }
}

registerProcessor("BbProcessor", BbProcessor);
