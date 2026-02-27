export class TTLCache {
  constructor() {
    this.entries = new Map();
  }

  async getOrSet(key, loader, options = {}) {
    const now = Date.now();
    const ttlMs = options.ttlMs ?? 60000;
    const staleMs = options.staleMs ?? 0;
    const force = options.force ?? false;
    const current = this.entries.get(key);

    if (!force && current && current.expiresAt > now) {
      return current.value;
    }

    if (current?.promise) {
      if (current.value !== undefined && current.expiresAt + staleMs > now) {
        return current.value;
      }
      return current.promise;
    }

    const promise = Promise.resolve()
      .then(loader)
      .then((value) => {
        this.entries.set(key, {
          value,
          updatedAt: Date.now(),
          expiresAt: Date.now() + ttlMs,
          promise: null,
        });
        return value;
      })
      .catch((error) => {
        if (current?.value !== undefined && current.expiresAt + staleMs > Date.now()) {
          return current.value;
        }
        this.entries.delete(key);
        throw error;
      });

    this.entries.set(key, {
      value: current?.value,
      updatedAt: current?.updatedAt ?? 0,
      expiresAt: current?.expiresAt ?? 0,
      promise,
    });

    if (!force && current?.value !== undefined && current.expiresAt + staleMs > now) {
      promise.catch(() => {});
      return current.value;
    }

    return promise;
  }

  peek(key) {
    return this.entries.get(key)?.value;
  }

  delete(key) {
    this.entries.delete(key);
  }

  clear() {
    this.entries.clear();
  }
}
