const AudioContext = window.AudioContext || webkitAudioContext
const todo = () => {}
const byteBeatNode = todo()
//byteBeatNode.connect(audioContext.destination)

const exampleSource = "Math.sin(t / sampleRate * Math.PI * 2 * 220)"

const compileAudioWorklet = (audioCtx, source, label) => {
  const sourceString = `
  class BbProcessor extends AudioWorkletProcessor {
    constructor() {
      super();
      this.globalSample = 0;
    }

    process(inputs, outputs, parameters) {
      for (let s = 0; s < outputs[0][0].length; s++) {
          const t = this.globalSample + s;
          outputs[0][0][s] = ${source};
      }
      this.globalSample += outputs[0][0].length
      return true
    }
  }

  registerProcessor("BbProcessor" + ${label}, BbProcessor)
  `.trim();

  const blob = new Blob([sourceString], { type: "text/javascript"})
  const url = URL.createObjectURL(blob);
  console.log({blob, url})
  audioCtx.audioWorklet.addModule(url);


}





const hasLoaded = new Promise((resolve, reject) => {
  document.onclick = () => {
    const audioContext = new AudioContext()
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(resolve)
    }
    compileAudioWorklet(audioContext, exampleSource, 0);
  }
})
