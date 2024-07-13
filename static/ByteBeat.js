export class ByteBeat {
  constructor(audioContext, bbNode, gainNode) {
    this.audioContext = audioContext;
    this.bbNode = bbNode;
    this.gainNode = gainNode;
  }

  setProgram(progText) {
    const fnText = this.validateProgram(progText);
    this.bbNode.port.postMessage({ type: "updateFn", body: fnText });
  }

  setGain(gain) {
    if (gain < 0) {
      gain = 0;
    } else if (gain > 1) {
      gain = 1;
    }

    this.gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
  }

  validateProgram(progText) {
    // TODO validate tokens
    const fnText = `(t) => ${progText}`;
    eval(fnText);
    return fnText;
  }
}
