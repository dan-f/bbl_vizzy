const AudioContext = window.AudioContext || webkitAudioContext;
const todo = () => {};
const byteBeatNode = todo();
//byteBeatNode.connect(audioContext.destination)

const exampleSource = "t * ((t>>12|t>>8)&63&t>>4)";

const compileAudioWorklet = async (audioCtx, source, label) => {
  const sourceString = `
  class BbProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.globalSample = 0;

      this.cachedValue = 0;
      this.counter = 0;
      this.heldSamples = 2;
    }

    process(inputs, outputs, parameters) {
      for (let s = 0; s < outputs[0][0].length; s++) {

          if (this.counter === 0) {
            const t = this.globalSample;
            this.globalSample += 1;
            let out = (${source}) & 0xffff;
            out /= 0xffff;
            out *= 2;
            out -= 1;
            this.counter = this.heldSamples;
            this.cachedValue = out;
          }
          this.counter--;

          outputs[0][0][s] = this.cachedValue;
      }
      // this.globalSample += outputs[0][0].length
      return true
    }
  }

  registerProcessor("BbProcessor${label}", BbProcessor)
  `.trim();

  const blob = new Blob([sourceString], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  console.log({ blob, url });
  await audioCtx.audioWorklet.addModule(url);
};

const hasLoaded = new Promise(async (resolve, reject) => {
  document.onclick = async () => {
    const audioContext = new AudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume().then(resolve);
    }
    await compileAudioWorklet(audioContext, exampleSource, 0);
    workletNode = new AudioWorkletNode(audioContext, "BbProcessor0");
    workletNode.connect(audioContext.destination);
  };
});
