import { mkdir, readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";

import { defaultUserPreferences } from "./config.mjs";

const DEFAULT_STATE = {
  users: [],
  sessions: [],
  workspaces: [],
  alerts: [],
  notes: [],
  destinations: [],
  digests: [],
  activity: [],
  aiSnapshots: {},
};

export class JsonStorage {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = null;
    this.writeChain = Promise.resolve();
    this.transactionChain = Promise.resolve();
  }

  async init() {
    await mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      const raw = await readFile(this.filePath, "utf8");
      this.state = { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
      this.state = structuredClone(DEFAULT_STATE);
      await this.flush();
    }
  }

  async readState() {
    if (!this.state) {
      await this.init();
    }
    return this.state;
  }

  async flush() {
    const state = await this.readState();
    const payload = `${JSON.stringify(state, null, 2)}\n`;
    this.writeChain = this.writeChain.then(() => writeFile(this.filePath, payload, "utf8"));
    return this.writeChain;
  }

  async transaction(mutator) {
    const run = async () => {
      const current = await this.readState();
      const next = structuredClone(current);
      const result = await mutator(next);
      this.state = next;
      await this.flush();
      return result;
    };

    const pending = this.transactionChain.then(run, run);
    this.transactionChain = pending.then(
      () => undefined,
      () => undefined,
    );
    return pending;
  }

  async findUserByEmail(email) {
    const state = await this.readState();
    return state.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
  }

  async findUserById(userId) {
    const state = await this.readState();
    return state.users.find((user) => user.id === userId) ?? null;
  }

  async createUser({ name, email, passwordHash, passwordSalt }) {
    return this.transaction((state) => {
      if (state.users.some((user) => user.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new Error("That email is already registered.");
      }

      const now = new Date().toISOString();
      const user = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        passwordSalt,
        createdAt: now,
        lastLoginAt: now,
        preferences: defaultUserPreferences(),
      };

      state.users.push(user);
      pushActivity(state, user.id, "account.created", "Account created.", {});
      return user;
    });
  }

  async updateUserLogin(userId) {
    return this.transaction((state) => {
      const user = requireItem(state.users.find((entry) => entry.id === userId), "User not found.");
      user.lastLoginAt = new Date().toISOString();
      return user;
    });
  }

  async updateUserPreferences(userId, patch) {
    return this.transaction((state) => {
      const user = requireItem(state.users.find((entry) => entry.id === userId), "User not found.");
      user.preferences = {
        ...defaultUserPreferences(),
        ...user.preferences,
        ...patch,
      };
      return user.preferences;
    });
  }

  async createSession(userId, ttlMs) {
    return this.transaction((state) => {
      const now = Date.now();
      const session = {
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date(now).toISOString(),
        expiresAt: new Date(now + ttlMs).toISOString(),
      };
      state.sessions.push(session);
      return session;
    });
  }

  async findSession(sessionId) {
    const state = await this.readState();
    const session = state.sessions.find((entry) => entry.id === sessionId) ?? null;
    if (!session) {
      return null;
    }
    if (Date.parse(session.expiresAt) <= Date.now()) {
      await this.deleteSession(sessionId);
      return null;
    }
    return session;
  }

  async deleteSession(sessionId) {
    return this.transaction((state) => {
      state.sessions = state.sessions.filter((session) => session.id !== sessionId);
      return true;
    });
  }

  async cleanupExpiredSessions() {
    return this.transaction((state) => {
      const now = Date.now();
      state.sessions = state.sessions.filter((session) => Date.parse(session.expiresAt) > now);
      return state.sessions.length;
    });
  }

  async getAiSnapshot(key) {
    const state = await this.readState();
    return state.aiSnapshots?.[key] ?? null;
  }

  async getLatestAiSnapshot({ universe, horizon, bullishCount, bearishCount }) {
    const state = await this.readState();
    const entries = Object.entries(state.aiSnapshots ?? {})
      .filter(([key]) => key.endsWith(`:${universe}:${horizon}:${bullishCount}:${bearishCount}`))
      .sort((left, right) => new Date(right[1]?.asOf ?? 0) - new Date(left[1]?.asOf ?? 0));
    return entries[0]?.[1] ?? null;
  }

  async saveAiSnapshot(key, snapshot) {
    return this.transaction((state) => {
      state.aiSnapshots ??= {};
      state.aiSnapshots[key] = snapshot;

      const entries = Object.entries(state.aiSnapshots)
        .sort((left, right) => new Date(right[1]?.asOf ?? 0) - new Date(left[1]?.asOf ?? 0))
        .slice(0, 45);
      state.aiSnapshots = Object.fromEntries(entries);
      return snapshot;
    });
  }

  async listWorkspaces(userId) {
    const state = await this.readState();
    return state.workspaces
      .filter((workspace) => workspace.userId === userId)
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  }

  async saveWorkspace(userId, input) {
    return this.transaction((state) => {
      const now = new Date().toISOString();
      let workspace = input.id
        ? state.workspaces.find((entry) => entry.id === input.id && entry.userId === userId)
        : null;

      if (input.isDefault) {
        for (const item of state.workspaces) {
          if (item.userId === userId) {
            item.isDefault = false;
          }
        }
      }

      if (!workspace) {
        workspace = {
          id: crypto.randomUUID(),
          userId,
          createdAt: now,
        };
        state.workspaces.push(workspace);
      }

      workspace.name = input.name?.trim() || "Untitled workspace";
      workspace.snapshot = input.snapshot ?? {};
      workspace.updatedAt = now;
      workspace.isDefault = Boolean(input.isDefault);

      pushActivity(state, userId, "workspace.saved", `Workspace "${workspace.name}" saved.`, {
        workspaceId: workspace.id,
      });

      return workspace;
    });
  }

  async deleteWorkspace(userId, workspaceId) {
    return this.transaction((state) => {
      const workspace = requireItem(
        state.workspaces.find((entry) => entry.id === workspaceId && entry.userId === userId),
        "Workspace not found.",
      );
      state.workspaces = state.workspaces.filter((entry) => entry.id !== workspaceId);
      state.notes = state.notes.filter((note) => note.workspaceId !== workspaceId);
      pushActivity(state, userId, "workspace.deleted", `Workspace "${workspace.name}" deleted.`, {
        workspaceId,
      });
      return true;
    });
  }

  async listAlerts(userId) {
    const state = await this.readState();
    return state.alerts
      .filter((alert) => alert.userId === userId)
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  }

  async listActiveAlerts() {
    const state = await this.readState();
    return state.alerts.filter((alert) => alert.active);
  }

  async createAlert(userId, input) {
    return this.transaction((state) => {
      const now = new Date().toISOString();
      const alert = {
        id: crypto.randomUUID(),
        userId,
        symbol: input.symbol.trim().toUpperCase(),
        direction: input.direction === "below" ? "below" : "above",
        price: Number(input.price),
        active: true,
        createdAt: now,
        triggeredAt: null,
        lastSeenPrice: null,
      };
      state.alerts.unshift(alert);
      pushActivity(state, userId, "alert.created", `Alert created for ${alert.symbol}.`, {
        alertId: alert.id,
      });
      return alert;
    });
  }

  async deleteAlert(userId, alertId) {
    return this.transaction((state) => {
      const exists = state.alerts.some((alert) => alert.id === alertId && alert.userId === userId);
      state.alerts = state.alerts.filter((alert) => !(alert.id === alertId && alert.userId === userId));
      if (!exists) {
        throw new Error("Alert not found.");
      }
      return true;
    });
  }

  async triggerAlert(alertId, marketPrice) {
    return this.transaction((state) => {
      const alert = requireItem(state.alerts.find((entry) => entry.id === alertId), "Alert not found.");
      if (!alert.active) {
        return { alert, activity: null };
      }
      const now = new Date().toISOString();
      alert.active = false;
      alert.triggeredAt = now;
      alert.lastSeenPrice = marketPrice;
      const activity = pushActivity(
        state,
        alert.userId,
        "alert.triggered",
        `${alert.symbol} crossed ${alert.direction} ${alert.price}.`,
        { alertId: alert.id, symbol: alert.symbol, marketPrice },
      );
      return { alert, activity };
    });
  }

  async listNotes(userId) {
    const state = await this.readState();
    return state.notes
      .filter((note) => note.userId === userId)
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  }

  async saveNote(userId, input) {
    return this.transaction((state) => {
      const now = new Date().toISOString();
      let note = input.id
        ? state.notes.find((entry) => entry.id === input.id && entry.userId === userId)
        : null;
      if (!note) {
        note = {
          id: crypto.randomUUID(),
          userId,
          createdAt: now,
        };
        state.notes.push(note);
      }
      note.workspaceId = input.workspaceId ?? null;
      note.title = input.title?.trim() || "Untitled note";
      note.content = input.content?.trim() || "";
      note.updatedAt = now;
      pushActivity(state, userId, "note.saved", `Note "${note.title}" saved.`, {
        noteId: note.id,
        workspaceId: note.workspaceId,
      });
      return note;
    });
  }

  async deleteNote(userId, noteId) {
    return this.transaction((state) => {
      const exists = state.notes.some((note) => note.id === noteId && note.userId === userId);
      state.notes = state.notes.filter((note) => !(note.id === noteId && note.userId === userId));
      if (!exists) {
        throw new Error("Note not found.");
      }
      return true;
    });
  }

  async listActivity(userId, limit = 50) {
    const state = await this.readState();
    return state.activity.filter((item) => item.userId === userId).slice(0, limit);
  }

  async appendActivity(userId, type, message, metadata = {}) {
    return this.transaction((state) => pushActivity(state, userId, type, message, metadata));
  }

  async listDestinations(userId) {
    const state = await this.readState();
    return state.destinations
      .filter((destination) => destination.userId === userId)
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  }

  async listDestinationsByPurpose(userId, purpose) {
    const destinations = await this.listDestinations(userId);
    return destinations.filter((destination) => destination.active && destination.purposes.includes(purpose));
  }

  async saveDestination(userId, input) {
    return this.transaction((state) => {
      const now = new Date().toISOString();
      let destination = input.id
        ? state.destinations.find((entry) => entry.id === input.id && entry.userId === userId)
        : null;

      if (!destination) {
        destination = {
          id: crypto.randomUUID(),
          userId,
          createdAt: now,
        };
        state.destinations.push(destination);
      }

      destination.kind = input.kind;
      destination.label = input.label?.trim() || `${input.kind} destination`;
      destination.target = input.target?.trim() || "";
      destination.active = input.active !== false;
      destination.purposes = input.purposes?.length ? [...new Set(input.purposes)] : ["alert"];
      destination.updatedAt = now;

      pushActivity(state, userId, "destination.saved", `Destination "${destination.label}" saved.`, {
        destinationId: destination.id,
        kind: destination.kind,
      });

      return destination;
    });
  }

  async deleteDestination(userId, destinationId) {
    return this.transaction((state) => {
      const exists = state.destinations.some(
        (destination) => destination.id === destinationId && destination.userId === userId,
      );
      state.destinations = state.destinations.filter(
        (destination) => !(destination.id === destinationId && destination.userId === userId),
      );
      for (const digest of state.digests) {
        if (digest.userId === userId) {
          digest.destinationIds = (digest.destinationIds ?? []).filter((id) => id !== destinationId);
        }
      }
      if (!exists) {
        throw new Error("Destination not found.");
      }
      pushActivity(state, userId, "destination.deleted", "Notification destination deleted.", {
        destinationId,
      });
      return true;
    });
  }

  async listDigests(userId) {
    const state = await this.readState();
    return state.digests
      .filter((digest) => digest.userId === userId)
      .sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt));
  }

  async listDueDigests(referenceTime = Date.now()) {
    const state = await this.readState();
    return state.digests.filter(
      (digest) => digest.active && digest.nextRunAt && Date.parse(digest.nextRunAt) <= referenceTime,
    );
  }

  async saveDigest(userId, input) {
    return this.transaction((state) => {
      const now = new Date().toISOString();
      let digest = input.id
        ? state.digests.find((entry) => entry.id === input.id && entry.userId === userId)
        : null;

      if (!digest) {
        digest = {
          id: crypto.randomUUID(),
          userId,
          createdAt: now,
          lastSentAt: null,
        };
        state.digests.push(digest);
      }

      digest.name = input.name?.trim() || "Relationship Digest";
      digest.symbols = [...new Set((input.symbols ?? []).map((symbol) => symbol.trim().toUpperCase()).filter(Boolean))];
      digest.frequency = input.frequency;
      digest.destinationIds = [...new Set(input.destinationIds ?? [])];
      digest.active = input.active !== false;
      digest.updatedAt = now;
      digest.nextRunAt = digest.active ? nextDigestRunAt(digest.frequency, digest.lastSentAt ?? now) : null;

      pushActivity(state, userId, "digest.saved", `Digest "${digest.name}" saved.`, {
        digestId: digest.id,
        frequency: digest.frequency,
      });

      return digest;
    });
  }

  async deleteDigest(userId, digestId) {
    return this.transaction((state) => {
      const exists = state.digests.some((digest) => digest.id === digestId && digest.userId === userId);
      state.digests = state.digests.filter((digest) => !(digest.id === digestId && digest.userId === userId));
      if (!exists) {
        throw new Error("Digest not found.");
      }
      pushActivity(state, userId, "digest.deleted", "Digest deleted.", { digestId });
      return true;
    });
  }

  async markDigestRun(digestId, deliveryResults) {
    return this.transaction((state) => {
      const digest = requireItem(state.digests.find((entry) => entry.id === digestId), "Digest not found.");
      const now = new Date().toISOString();
      digest.lastSentAt = now;
      digest.nextRunAt = digest.active ? nextDigestRunAt(digest.frequency, now) : null;
      digest.lastDelivery = {
        deliveredAt: now,
        deliveryResults,
      };

      const okCount = deliveryResults.filter((result) => result.ok).length;
      const activity = pushActivity(
        state,
        digest.userId,
        "digest.sent",
        `Digest "${digest.name}" sent to ${okCount}/${deliveryResults.length} destinations.`,
        { digestId: digest.id, deliveryResults },
      );

      return { digest, activity };
    });
  }
}

function requireItem(value, message) {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

function pushActivity(state, userId, type, message, metadata = {}) {
  const activity = {
    id: crypto.randomUUID(),
    userId,
    type,
    message,
    createdAt: new Date().toISOString(),
    metadata,
  };
  state.activity.unshift(activity);
  return activity;
}

function nextDigestRunAt(frequency, baseTime) {
  const base = new Date(baseTime);
  const next = new Date(base);

  if (frequency === "hourly") {
    next.setHours(next.getHours() + 1);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}
