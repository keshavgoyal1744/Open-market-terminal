import net from "node:net";
import tls from "node:tls";
import os from "node:os";
import { spawn } from "node:child_process";

export class NotificationService {
  constructor(config) {
    this.config = config;
  }

  async sendAlert({ user, alert, marketPrice, destinations }) {
    const subject = `Alert: ${alert.symbol} crossed ${alert.direction} ${alert.price}`;
    const text = [
      `Open Market Terminal alert for ${user.name || user.email}`,
      "",
      `${alert.symbol} crossed ${alert.direction} ${alert.price}.`,
      `Current price: ${marketPrice}`,
      `Triggered at: ${alert.triggeredAt ?? new Date().toISOString()}`,
      `App: ${this.config.appUrl}`,
    ].join("\n");

    const json = {
      type: "alert.triggered",
      user: { id: user.id, email: user.email, name: user.name },
      alert,
      marketPrice,
      appUrl: this.config.appUrl,
    };

    return this.deliver(destinations, { subject, text, json });
  }

  async sendDigest({ user, digest, intelRecords, destinations }) {
    const subject = `Digest: ${digest.name}`;
    const lines = [
      `Open Market Terminal digest for ${user.name || user.email}`,
      `Digest: ${digest.name}`,
      `Frequency: ${digest.frequency}`,
      "",
    ];

    for (const intel of intelRecords) {
      lines.push(`${intel.symbol} - ${intel.companyName}`);
      lines.push(`Summary: ${intel.summary ?? intel.headline ?? "n/a"}`);
      if (intel.eventChains?.length) {
        lines.push(`Impact chain: ${intel.eventChains[0].title} -> ${intel.eventChains[0].steps.join(" -> ")}`);
      }
      if (intel.supplyChain?.suppliers?.length) {
        lines.push(`Key dependency: ${intel.supplyChain.suppliers[0].target} (${intel.supplyChain.suppliers[0].label})`);
      }
      if (intel.ownership?.topInstitutionalHolders?.length) {
        lines.push(`Top holder: ${intel.ownership.topInstitutionalHolders[0].holder}`);
      }
      lines.push("");
    }

    const json = {
      type: "digest.sent",
      user: { id: user.id, email: user.email, name: user.name },
      digest,
      generatedAt: new Date().toISOString(),
      appUrl: this.config.appUrl,
      records: intelRecords,
    };

    return this.deliver(destinations, { subject, text: lines.join("\n"), json });
  }

  async deliver(destinations, payload) {
    const results = [];
    for (const destination of destinations) {
      try {
        if (destination.kind === "webhook") {
          await this.sendWebhook(destination, payload);
        } else if (destination.kind === "email") {
          await this.sendEmail(destination, payload);
        } else {
          throw new Error(`Unsupported destination kind: ${destination.kind}`);
        }

        results.push({
          destinationId: destination.id,
          kind: destination.kind,
          ok: true,
          sentAt: new Date().toISOString(),
        });
      } catch (error) {
        results.push({
          destinationId: destination.id,
          kind: destination.kind,
          ok: false,
          sentAt: new Date().toISOString(),
          error: error.message,
        });
      }
    }
    return results;
  }

  async sendWebhook(destination, payload) {
    const response = await fetch(destination.target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: {
          id: destination.id,
          label: destination.label,
          kind: destination.kind,
        },
        ...payload.json,
        subject: payload.subject,
        text: payload.text,
      }),
      signal: AbortSignal.timeout(this.config.notificationTimeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Webhook delivery failed with ${response.status}.`);
    }
  }

  async sendEmail(destination, payload) {
    if (this.config.sendmailPath) {
      return sendViaSendmail(this.config.sendmailPath, {
        from: this.config.emailFrom,
        to: destination.target,
        subject: payload.subject,
        text: payload.text,
      });
    }

    if (!this.config.smtpHost) {
      throw new Error("SMTP is not configured. Set SMTP_* env vars or SENDMAIL_PATH.");
    }

    const client = new SimpleSmtpClient(this.config);
    await client.send({
      from: this.config.emailFrom,
      to: destination.target,
      subject: payload.subject,
      text: payload.text,
    });
  }
}

class SimpleSmtpClient {
  constructor(config) {
    this.config = config;
  }

  async send({ from, to, subject, text }) {
    let socket = await this.connect();
    await expectCode(await readResponse(socket), 220);
    await this.command(socket, `EHLO ${safeHostname()}`, [250]);

    if (this.config.smtpStartTls && !this.config.smtpSecure) {
      await this.command(socket, "STARTTLS", [220]);
      socket = await upgradeToTls(socket, this.config.smtpHost);
      await this.command(socket, `EHLO ${safeHostname()}`, [250]);
    }

    if (this.config.smtpUser) {
      await this.authenticate(socket);
    }

    await this.command(socket, `MAIL FROM:<${extractEmail(from)}>`, [250]);
    await this.command(socket, `RCPT TO:<${extractEmail(to)}>`, [250, 251]);
    await this.command(socket, "DATA", [354]);

    const body = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      escapeSmtpBody(text),
      ".",
    ].join("\r\n");

    socket.write(body);
    await expectCode(await readResponse(socket), 250);
    await this.command(socket, "QUIT", [221]);
    socket.end();
  }

  async connect() {
    if (this.config.smtpSecure) {
      return new Promise((resolve, reject) => {
        const socket = tls.connect(
          {
            host: this.config.smtpHost,
            port: this.config.smtpPort,
            servername: this.config.smtpHost,
          },
          () => resolve(socket),
        );
        socket.on("error", reject);
      });
    }

    return new Promise((resolve, reject) => {
      const socket = net.createConnection(
        {
          host: this.config.smtpHost,
          port: this.config.smtpPort,
        },
        () => resolve(socket),
      );
      socket.on("error", reject);
    });
  }

  async authenticate(socket) {
    const authPlain = Buffer.from(`\u0000${this.config.smtpUser}\u0000${this.config.smtpPass}`).toString("base64");
    try {
      await this.command(socket, `AUTH PLAIN ${authPlain}`, [235]);
      return;
    } catch {
      await this.command(socket, "AUTH LOGIN", [334]);
      await this.command(socket, Buffer.from(this.config.smtpUser).toString("base64"), [334]);
      await this.command(socket, Buffer.from(this.config.smtpPass).toString("base64"), [235]);
    }
  }

  async command(socket, line, expectedCodes) {
    socket.write(`${line}\r\n`);
    return expectCode(await readResponse(socket), expectedCodes);
  }
}

function sendViaSendmail(sendmailPath, mail) {
  return new Promise((resolve, reject) => {
    const child = spawn(sendmailPath, ["-t", "-i"]);
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr.trim() || `sendmail exited with code ${code}`));
      }
    });
    child.stdin.end(
      [
        `From: ${mail.from}`,
        `To: ${mail.to}`,
        `Subject: ${mail.subject}`,
        "Content-Type: text/plain; charset=utf-8",
        "",
        mail.text,
      ].join("\n"),
    );
  });
}

function readResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const lines = [];

    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      while (buffer.includes("\n")) {
        const newlineIndex = buffer.indexOf("\n");
        const line = buffer.slice(0, newlineIndex).replace(/\r$/, "");
        buffer = buffer.slice(newlineIndex + 1);
        lines.push(line);
        if (/^\d{3} /.test(line)) {
          cleanup();
          resolve({
            code: Number(line.slice(0, 3)),
            lines,
          });
          return;
        }
      }
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

function expectCode(response, expectedCodes) {
  const expected = Array.isArray(expectedCodes) ? expectedCodes : [expectedCodes];
  if (!expected.includes(response.code)) {
    throw new Error(`SMTP expected ${expected.join("/")} but received ${response.code}: ${response.lines.join(" | ")}`);
  }
  return response;
}

function upgradeToTls(socket, host) {
  return new Promise((resolve, reject) => {
    const secureSocket = tls.connect(
      {
        socket,
        servername: host,
      },
      () => resolve(secureSocket),
    );
    secureSocket.on("error", reject);
  });
}

function safeHostname() {
  return os.hostname().replace(/[^\w.-]/g, "") || "localhost";
}

function extractEmail(value) {
  const match = String(value ?? "").match(/<([^>]+)>/);
  return match?.[1] ?? String(value ?? "").trim();
}

function escapeSmtpBody(text) {
  return String(text ?? "")
    .replace(/\r?\n/g, "\r\n")
    .replace(/^\./gm, "..");
}
