export class EventEmitter<Event> {
  subscribers: Set<Subscription<Event>> = new Set();

  subscribe(s: Subscription<Event>): Unsubscribe {
    this.subscribers.add(s);
    return () => {
      this.subscribers.delete(s);
    };
  }

  emit(e: Event) {
    for (const s of this.subscribers) {
      s(e);
    }
  }
}

export type Subscription<Event> = (event: Event) => void;

export type Unsubscribe = () => void;
