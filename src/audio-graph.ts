import byteBeatProcessorUrl from "./byte-beat/processor?url";

export interface AudioGraph {
  bbNode: AudioWorkletNode;
  analyserNode: AnalyserNode;
  gainNode: GainNode;
}

export async function createAudioGraph(
  audioCtx: AudioContext,
): Promise<AudioGraph> {
  await audioCtx.audioWorklet.addModule(byteBeatProcessorUrl);

  const bbNode = new AudioWorkletNode(audioCtx, "ByteBeatProcessor");
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.15;
  const analyserNode = audioCtx.createAnalyser();
  analyserNode.fftSize = 2 ** 13;

  bbNode.connect(gainNode);
  bbNode.connect(analyserNode);
  gainNode.connect(audioCtx.destination);

  return { bbNode, analyserNode, gainNode };
}
