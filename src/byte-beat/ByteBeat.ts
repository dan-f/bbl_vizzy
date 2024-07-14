import { BbMessage, BbMessageType } from "./message";
import { ValidatedProgram } from "./program";

export class ByteBeat {
  programText: string = "((t >> 10) & 42) * t";
  audioCtx: AudioContext;
  bbNode: AudioWorkletNode;
  gainNode: GainNode;

  constructor(
    audioCtx: AudioContext,
    bbNode: AudioWorkletNode,
    gainNode: GainNode,
  ) {
    this.audioCtx = audioCtx;
    this.bbNode = bbNode;
    this.gainNode = gainNode;
  }

  setPlaying(shouldPlay: boolean) {
    if (shouldPlay) {
      this.audioCtx.resume();
    } else {
      this.audioCtx.suspend();
    }
  }

  evalProgram(program: ValidatedProgram) {
    this.sendMessage({ type: BbMessageType.UpdateFn, body: program.fnText });
  }

  setGain(gain: number) {
    if (gain < 0) {
      gain = 0;
    } else if (gain > 1) {
      gain = 1;
    }

    this.gainNode.gain.value = gain;
  }

  setBitDepth(bitDepth: number) {
    this.bbNode.parameters.get("bitDepth")!.value = bitDepth;
  }

  setSampleRate(sampleRate: number) {
    this.bbNode.parameters.get("sampleRate")!.value = sampleRate;
  }

  private sendMessage(msg: BbMessage) {
    this.bbNode.port.postMessage(msg);
  }
}
