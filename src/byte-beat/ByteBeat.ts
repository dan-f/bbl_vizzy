import { EventEmitter, Subscription, Unsubscribe } from "../EventEmitter";
import { BbMessage, BbMessageType } from "./message";

export interface State {
  playing: boolean;
  gain: number;
  bitDepth: number;
  sampleRate: number;
}

export interface StateChange {
  state: State;
}

export class ByteBeat {
  audioCtx: AudioContext;
  bbNode: AudioWorkletNode;
  gainNode: GainNode;
  eventEmitter: EventEmitter<StateChange> = new EventEmitter();

  constructor(
    audioCtx: AudioContext,
    bbNode: AudioWorkletNode,
    gainNode: GainNode,
  ) {
    this.audioCtx = audioCtx;
    this.bbNode = bbNode;
    this.gainNode = gainNode;

    this._emitStateEvent = this._emitStateEvent.bind(this);

    // forward `playing` state changes
    this.audioCtx.addEventListener("statechange", this._emitStateEvent);
  }

  get state(): State {
    return {
      playing: this.audioCtx.state === "running",
      gain: this.gainNode.gain.value,
      bitDepth: this.bbNode.parameters.get("bitDepth")!.value,
      sampleRate: this.bbNode.parameters.get("sampleRate")!.value,
    };
  }

  togglePlaying() {
    return this.state.playing ? this._pause() : this._play();
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

    this.gainNode.gain.value = gain;
    this._emitStateEvent();
  }

  subscribeToStateChange(s: Subscription<StateChange>): Unsubscribe {
    return this.eventEmitter.subscribe(s);
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

  _emitStateEvent() {
    this.eventEmitter.emit({ state: this.state });
  }
}
