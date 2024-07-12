import { Vizzy } from "./vizzy.js";
const AudioContext = window.AudioContext || webkitAudioContext;

let workletNode;

const progs = [
  "t * ((t>>12|t>>8)&63&t>>4)",
  "((t >> 10) & 42) * t",
  "t*(((t>>12)|(t>>8))&(63&(t>>4)))",
  "(t*(t>>5|t>>8))>>(t>>16)",
  "t*(((t>>9)|(t>>13))&(25&(t>>6)))",
  "t*(((t>>11)&(t>>8))&(123&(t>>3)))",
  "t*(t>>8*((t>>15)|(t>>8))&(20|(t>>19)*5>>t|(t>>3)))",
  "(-t&4095)*(255&t*(t&(t>>13)))>>12)+(127&t*(234&t>>8&t>>3)>>(3&t>>14))",
  "t*(t>>((t>>9)|(t>>8))&(63&(t>>4)))",
  "(t>>6|t|t>>(t>>16))*10+((t>>11)&7)",
  // "v=(v>>1)+(v>>4)+t*(((t>>16)|(t>>6))&(69&(t>>9)))",
  "(t|(t>>9|t>>7))*t&(t>>11|t>>9)",
];

let didLoad = new Promise((resolve, reject) => {
  document.onclick = async () => {
    const audioContext = new AudioContext();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    await audioContext.audioWorklet.addModule("static/bb.processor.js");

    workletNode = new AudioWorkletNode(audioContext, "BbProcessor");
    const vizzy = new Vizzy(audioContext);
    workletNode.connect(vizzy.inlet);
    workletNode.connect(audioContext.destination);

    document.onmousemove = (event) => {
      const sr = event.clientX / window.innerWidth;
      const bd = event.clientY / window.innerHeight;
      workletNode.parameters.get("sampleRate").setValueAtTime(sr, 0);
      workletNode.parameters.get("bitDepth").setValueAtTime(bd, 0);
    };

    resolve();
  };
});

didLoad.then(() => {
  let i = 0;
  setInterval(() => {
    workletNode.port.postMessage(`(t) => ${progs[i]}`);
    i = (i + 1) % progs.length;
  }, 2000);
});
