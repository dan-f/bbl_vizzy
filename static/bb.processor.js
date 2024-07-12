class BbProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.globalSample = 0;
    this.cachedValue = 0;
    this.counter = 0;
    this.heldSamples = 2;

    this.fn = (t) => 0;
    this.port.onmessage = (event) => {
      this.fn = eval(event.data);
    };
  }

  process(inputs, outputs, parameters) {
    for (let s = 0; s < outputs[0][0].length; s++) {
      if (this.counter === 0) {
        const t = this.globalSample;
        this.globalSample += 1;
        const mask = 0xff;
        let out = this.fn(t) & mask;
        out /= mask;
        out *= 2;
        out -= 1;
        this.counter = this.heldSamples;
        this.cachedValue = out;
      }
      this.counter--;

      outputs[0][0][s] = this.cachedValue;
    }
    return true;
  }
}

registerProcessor("BbProcessor", BbProcessor);
