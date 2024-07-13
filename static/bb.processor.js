class BbProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.globalSample = 0;
    this.cachedValue = 0;
    this.counter = 0;
    this.fn = (t) => 0;

    this.port.onmessage = (event) => {
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

  process(inputs, outputs, parameters) {
    for (let s = 0; s < outputs[0][0].length; s++) {
      if (this.counter <= 0) {
        const t = this.globalSample;
        this.globalSample += 1;

        let bdDefault = 8;
        let bdMin = 1;
        let bdMax = 16;
        let bdParam =
          parameters["bitDepth"][0] ?? (bdDefault - bdMin) / (bdMax - bdMin);
        const bitDepth = parseInt(bdParam * 15) + 1;

        let srDefault = 8000;
        let srMin = 1000;
        let srMax = 20000;
        let srParam =
          parameters["sampleRate"][0] ?? (srDefault - srMin) / (srMax - srMin);
        const sRate = srParam * 19000 + 1000;

        const mask = (1 << bitDepth) - 1;
        let out = this.fn(t) & mask;
        out /= mask;
        out *= 2;
        out -= 1;
        let remainder = 1.0 - this.counter;
        this.counter = sampleRate / sRate + remainder;
        this.cachedValue = out;
      }
      this.counter--;

      outputs[0][0][s] = Math.tanh(50 * this.cachedValue);
    }
    return true;
  }

  processMessage(message) {
    switch (message.type) {
      case "updateFn": {
        this.fn = eval(message.body);
      }
    }
  }
}

registerProcessor("BbProcessor", BbProcessor);
