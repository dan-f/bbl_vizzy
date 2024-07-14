import { BbMessage, BbMessageType } from "./message";

export class ByteBeat {
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

  get playing(): boolean {
    return this.audioCtx.state === "running";
  }

  togglePlaying() {
    return this.playing ? this._pause() : this._play();
  }

  setProgram(progText: string) {
    const fnText = this._validateProgram(progText);
    this._sendMessage({ type: BbMessageType.UpdateFn, body: fnText });
  }

  setGain(gain: number) {
    if (gain < 0) {
      gain = 0;
    } else if (gain > 1) {
      gain = 1;
    }

    this.gainNode.gain.setValueAtTime(gain, this.audioCtx.currentTime);
  }

  subscribeToPlaystate(cb: (playing: boolean) => void) {
    return this.audioCtx.addEventListener("statechange", () =>
      cb(this.playing),
    );
  }

  _validateProgram(progText: string): string {
    // TODO validate tokens
    const fnText = `(t) => ${progText}`;
    eval(fnText);
    return fnText;
  }

  _play() {
    this.audioCtx.resume();
  }

  _pause() {
    this.audioCtx.suspend();
  }

  _sendMessage(msg: BbMessage) {
    this.bbNode.port.postMessage(msg);
  }
}
