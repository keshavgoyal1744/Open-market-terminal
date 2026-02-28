import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, "..");
const isServerless = Boolean(
  process.env.VERCEL || process.env.AWS_REGION || process.env.LAMBDA_TASK_ROOT || process.env.NOW_REGION,
);
const defaultDataDir = isServerless ? "/tmp/open-market-terminal-data" : path.join(appRoot, "data");

export const config = {
  appRoot,
  isServerless,
  dataDir: process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : defaultDataDir,
  dataFile: process.env.DATA_FILE
    ? path.resolve(process.env.DATA_FILE)
    : path.join(process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : defaultDataDir, "state.json"),
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? "127.0.0.1",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "omt_session",
  sessionTtlMs: Number(process.env.SESSION_TTL_MS ?? 1000 * 60 * 60 * 24 * 30),
  sessionSecret: process.env.SESSION_SECRET ?? "change-me-in-production",
  secureCookies: (process.env.SECURE_COOKIES ?? "false").toLowerCase() === "true",
  quoteTtlMs: Number(process.env.QUOTE_TTL_MS ?? 15000),
  historyTtlMs: Number(process.env.HISTORY_TTL_MS ?? 300000),
  companyTtlMs: Number(process.env.COMPANY_TTL_MS ?? 900000),
  macroTtlMs: Number(process.env.MACRO_TTL_MS ?? 1800000),
  calendarTtlMs: Number(process.env.CALENDAR_TTL_MS ?? 900000),
  newsTtlMs: Number(process.env.NEWS_TTL_MS ?? 120000),
  yieldCurveTtlMs: Number(process.env.YIELD_CURVE_TTL_MS ?? 1800000),
  cryptoOrderBookTtlMs: Number(process.env.CRYPTO_ORDERBOOK_TTL_MS ?? 5000),
  aiTtlMs: Number(process.env.AI_TTL_MS ?? 1800000),
  aiTimeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 30000),
  aiDailyTimezone: process.env.AI_DAILY_TIMEZONE ?? "America/New_York",
  aiDailyHour: Number(process.env.AI_DAILY_HOUR ?? 10),
  aiDailyMinute: Number(process.env.AI_DAILY_MINUTE ?? 0),
  digestCheckMs: Number(process.env.DIGEST_CHECK_MS ?? 300000),
  notificationTimeoutMs: Number(process.env.NOTIFICATION_TIMEOUT_MS ?? 10000),
  authWindowMs: Number(process.env.AUTH_WINDOW_MS ?? 15 * 60 * 1000),
  authMaxRequests: Number(process.env.AUTH_MAX_REQUESTS ?? 20),
  appUrl: process.env.APP_URL ?? `http://${process.env.HOST ?? "127.0.0.1"}:${process.env.PORT ?? 3000}`,
  emailFrom: process.env.EMAIL_FROM ?? "Open Market Terminal <no-reply@example.com>",
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: Number(process.env.SMTP_PORT ?? 465),
  smtpSecure: (process.env.SMTP_SECURE ?? "true").toLowerCase() === "true",
  smtpStartTls: (process.env.SMTP_STARTTLS ?? "false").toLowerCase() === "true",
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  sendmailPath: process.env.SENDMAIL_PATH ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  aiPrimaryProvider: process.env.AI_PRIMARY_PROVIDER ?? "gemini",
  aiFallbackProvider: process.env.AI_FALLBACK_PROVIDER ?? "groq",
  aiGeminiModel: process.env.AI_GEMINI_MODEL ?? "gemini-2.5-flash",
  aiGroqModel: process.env.AI_GROQ_MODEL ?? "llama-3.3-70b-versatile",
  defaultWatchlist: ["AAPL", "MSFT", "NVDA", "SPY", "TLT", "GLD", "EURUSD=X", "^GSPC"],
  defaultCryptoProducts: ["BTC-USD", "ETH-USD", "SOL-USD"],
  marketPulseSymbols: ["SPY", "QQQ", "DIA", "IWM", "TLT", "GLD", "USO", "EURUSD=X", "^VIX", "^GSPC"],
};

export function defaultUserPreferences() {
  return {
    watchlistSymbols: [...config.defaultWatchlist],
    researchPinnedSymbols: [],
    detailSymbol: "AAPL",
    companyMapCompareSymbol: "",
    terminalHotkeys: [],
    newsFocus: "",
    sectorFocus: "Technology",
    aiUniverse: "sp500",
    aiHorizon: "1-4w",
    cryptoProducts: [...config.defaultCryptoProducts],
    activePage: "overview",
    screenConfig: {
      symbols: "AAPL,MSFT,NVDA,AMZN,META,GOOGL,TSLA,JPM,XOM,UNH,AVGO,AMD,QQQ,SPY,TLT,GLD",
      maxPe: "",
      minMarketCap: "",
      minVolume: "",
      minChangePct: "",
    },
    portfolio: [],
    panelLayout: [],
    panelSizes: {},
  };
}
