import bbProcessorUrl from "./byte-beat/processor?url";

export interface AudioGraph {
  bbNode: AudioWorkletNode;
  analyserNode: AnalyserNode;
  gainNode: GainNode;
}

export async function createAudioGraph(
  audioCtx: AudioContext,
): Promise<AudioGraph> {
  await audioCtx.audioWorklet.addModule(bbProcessorUrl);

  const bbNode = new AudioWorkletNode(audioCtx, "BbProcessor");
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
  const analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2 ** 13;

  bbNode.connect(gainNode);
  bbNode.connect(analyserNode);
  gainNode.connect(audioCtx.destination);

  return { bbNode, analyserNode, gainNode };
}
