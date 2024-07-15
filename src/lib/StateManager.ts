import { EventEmitter, Subscription, Unsubscribe } from "./EventEmitter";
import { Logger } from "./Logger";

interface StateTransition<State> {
  state: Partial<State>;
}

export class StateManager<State extends object> {
  state: State;
  private log?: Logger;
  private eventEmitter = new EventEmitter<StateTransition<State>>();

  constructor(initialState: State, log?: Logger) {
    this.state = initialState;
    this.log = log?.withContext("StateManager");
    this.log?.debug("initial state", initialState);
  }

  subscribe(s: Subscription<StateTransition<State>>): Unsubscribe {
    return this.eventEmitter.subscribe(s);
  }

  transition(f: (s: State) => State) {
    const oldState = this.state;
    const updatedFields = this.getUpdatedFields(f(this.state));

    if (Object.keys(updatedFields).length === 0) {
      return;
    }

    const newState = { ...this.state, ...updatedFields };
    this.log?.debug("state transition", {
      oldState,
      newState,
      updatedFields,
    });
    this.state = newState;
    this.eventEmitter.emit({ state: updatedFields });
  }

  // shallow comparison
  private getUpdatedFields(s: State): Partial<State> {
    const partialState: Partial<State> = {};
    for (const k of Object.keys(s)) {
      const key = k as keyof State;
      if (s[key] !== this.state[key]) {
        partialState[key] = s[key];
      }
    }
    return partialState;
  }
}
