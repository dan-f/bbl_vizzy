import { ByteBeat } from "./ByteBeat.js";
import { Vizzy } from "./vizzy.js";

const AudioContext = window.AudioContext || webkitAudioContext;

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

async function main() {
  const audioContext = new AudioContext();
  const { bbNode, analyserNode, gainNode } = await createAudioGraph(
    audioContext
  );

  const byteBeat = new ByteBeat(audioContext, bbNode, gainNode);
  const vizzy = new Vizzy(analyserNode, document.getElementById("vizzy"));

  document.onclick = () => {
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  };

  cycleProgs(byteBeat);
}

function cycleProgs(byteBeat) {
  let i = 0;
  byteBeat.setProgram(progs[i]);
  setInterval(() => {
    i = (i + 1) % progs.length;
    byteBeat.setProgram(progs[i]);
  }, 2000);
}

async function createAudioGraph(audioContext) {
  await audioContext.audioWorklet.addModule("static/bb.processor.js");

  const bbNode = new AudioWorkletNode(audioContext, "BbProcessor");
  const gainNode = audioContext.createGain();
  const analyserNode = audioContext.createAnalyser();
  bbNode.connect(gainNode);
  gainNode.connect(analyserNode);
  gainNode.connect(audioContext.destination);

  analyserNode.fftSize = 2 ** 13;
  gainNode.gain.setValueAtTime(0.25, 0);

  return { bbNode, analyserNode, gainNode };
}

main();
