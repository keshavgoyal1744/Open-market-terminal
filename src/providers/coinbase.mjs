import { fetchJson } from "../http.mjs";

const COINBASE_HTTP = "https://api.exchange.coinbase.com";
const COINBASE_WS = "wss://ws-feed.exchange.coinbase.com";

export class CoinbaseTickerHub {
  constructor() {
    this.clients = new Set();
    this.products = new Set();
    this.snapshots = new Map();
    this.socket = null;
    this.reconnectTimer = null;
  }

  subscribe(products, client) {
    const cleanProducts = normalizeProducts(products);
    client.products = new Set(cleanProducts);
    this.clients.add(client);

    for (const product of cleanProducts) {
      this.products.add(product);
    }

    this.ensureSocket(true);

    return () => {
      this.clients.delete(client);
      this.recalculateProducts();
      if (!this.clients.size && this.socket) {
        this.socket.close();
        this.socket = null;
      }
    };
  }

  getSnapshot(product) {
    return this.snapshots.get(product) ?? null;
  }

  ensureSocket(forceResubscribe = false) {
    if (!this.products.size) {
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (forceResubscribe) {
        this.sendSubscribe();
      }
      return;
    }

    if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.socket = new WebSocket(COINBASE_WS);
    this.socket.addEventListener("open", () => this.sendSubscribe());
    this.socket.addEventListener("message", (event) => this.onMessage(event));
    this.socket.addEventListener("close", () => this.onClose());
    this.socket.addEventListener("error", () => this.onClose());
  }

  sendSubscribe() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.products.size) {
      return;
    }

    this.socket.send(
      JSON.stringify({
        type: "subscribe",
        product_ids: [...this.products],
        channels: ["ticker"],
      }),
    );
  }

  onMessage(event) {
    const payload = JSON.parse(event.data);
    if (payload.type !== "ticker" || !payload.product_id) {
      return;
    }

    const snapshot = {
      productId: payload.product_id,
      price: Number(payload.price),
      bestBid: Number(payload.best_bid),
      bestAsk: Number(payload.best_ask),
      volume24h: Number(payload.volume_24h),
      open24h: Number(payload.open_24h),
      low24h: Number(payload.low_24h),
      high24h: Number(payload.high_24h),
      time: payload.time,
      changePercent24h:
        payload.open_24h && payload.price ? ((Number(payload.price) - Number(payload.open_24h)) / Number(payload.open_24h)) * 100 : null,
    };

    this.snapshots.set(snapshot.productId, snapshot);

    for (const client of this.clients) {
      if (client.products.has(snapshot.productId)) {
        client.send(snapshot);
      }
    }
  }

  onClose() {
    if (this.reconnectTimer) {
      return;
    }

    this.socket = null;
    if (!this.clients.size || !this.products.size) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureSocket();
    }, 2000);
  }

  recalculateProducts() {
    const nextProducts = new Set();
    for (const client of this.clients) {
      for (const product of client.products) {
        nextProducts.add(product);
      }
    }

    const changed =
      nextProducts.size !== this.products.size ||
      [...nextProducts].some((product) => !this.products.has(product));

    this.products = nextProducts;
    if (!this.products.size) {
      return;
    }

    if (changed) {
      this.ensureSocket(true);
    }
  }
}

export async function getOrderBook(productId) {
  const url = new URL(`/products/${encodeURIComponent(productId)}/book`, COINBASE_HTTP);
  url.searchParams.set("level", "2");

  const payload = await fetchJson(url);
  return {
    productId,
    bids: (payload.bids ?? []).slice(0, 12).map(([price, size, orders]) => ({
      price: Number(price),
      size: Number(size),
      orders: Number(orders),
    })),
    asks: (payload.asks ?? []).slice(0, 12).map(([price, size, orders]) => ({
      price: Number(price),
      size: Number(size),
      orders: Number(orders),
    })),
  };
}

export async function getTicker(productId) {
  const url = new URL(`/products/${encodeURIComponent(productId)}/ticker`, COINBASE_HTTP);
  const payload = await fetchJson(url);
  const price = Number(payload.price);
  const open = Number(payload.open);
  return {
    productId,
    price,
    size: Number(payload.size),
    bid: Number(payload.bid),
    ask: Number(payload.ask),
    volume: Number(payload.volume),
    time: payload.time,
    changePercent24h: open ? ((price - open) / open) * 100 : null,
  };
}

function normalizeProducts(products) {
  return [...new Set(products.map((product) => product.trim().toUpperCase()).filter(Boolean))];
}
