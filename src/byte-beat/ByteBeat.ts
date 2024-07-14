import { EventEmitter, Subscription, Unsubscribe } from "../EventEmitter";
import { BbMessage, BbMessageType } from "./message";

export interface State {
  programText: string;
  playing: boolean;
  gain: number;
  bitDepth: number;
  sampleRate: number;
}

export interface StateChange {
  state: State;
}

export class ByteBeat {
  programText: string = "((t >> 10) & 42) * t";
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
      programText: this.programText,
      playing: this.audioCtx.state === "running",
      gain: this.gainNode.gain.value,
      bitDepth: this.bbNode.parameters.get("bitDepth")!.value,
      sampleRate: this.bbNode.parameters.get("sampleRate")!.value,
    };
  }

  subscribeToStateChange(s: Subscription<StateChange>): Unsubscribe {
    return this.eventEmitter.subscribe(s);
  }

  togglePlaying() {
    return this.state.playing ? this._pause() : this._play();
  }

  evalProgram(text: string) {
    const { programText, fnText } = this._validateProgram(text);
    this.programText = programText;
    this._sendMessage({ type: BbMessageType.UpdateFn, body: fnText });
    this._emitStateEvent();
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

  setBitDepth(bitDepth: number) {
    this.bbNode.parameters.get("bitDepth")!.value = bitDepth;
    this._emitStateEvent();
  }

  setSampleRate(sampleRate: number) {
    this.bbNode.parameters.get("sampleRate")!.value = sampleRate;
    this._emitStateEvent();
  }

  _validateProgram(programText: string): ValidatedProgram {
    // TODO validate tokens
    programText = programText.trim();
    const fnText = `(t) => ${programText}`;
    eval(fnText);
    return { programText, fnText };
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

interface ValidatedProgram {
  programText: string;
  fnText: string;
}
