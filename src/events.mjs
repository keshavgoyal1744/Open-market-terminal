export class UserEventHub {
  constructor() {
    this.listeners = new Map();
  }

  subscribe(userId, send) {
    const listeners = this.listeners.get(userId) ?? new Set();
    listeners.add(send);
    this.listeners.set(userId, listeners);

    return () => {
      const current = this.listeners.get(userId);
      if (!current) {
        return;
      }
      current.delete(send);
      if (!current.size) {
        this.listeners.delete(userId);
      }
    };
  }

  publish(userId, event) {
    const listeners = this.listeners.get(userId);
    if (!listeners?.size) {
      return;
    }

    for (const send of listeners) {
      send(event);
    }
  }
}
