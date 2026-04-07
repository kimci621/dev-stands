import { appendFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const AUDIT_LOG_PATH = resolve(process.cwd(), "server", "audit.log");

const truncate = (value, maxLength = 500) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

export function getAuditRequestContext(event) {
  const request = event?.node?.req;
  const headers = request?.headers || {};

  return {
    method: request?.method || null,
    path: event?.path || request?.url || null,
    ip:
      headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      request?.socket?.remoteAddress ||
      null,
    userAgent: truncate(headers["user-agent"] || null, 300),
    referer: truncate(headers.referer || headers.referrer || null, 500),
  };
}

export async function writeAuditLog(payload) {
  try {
    await mkdir(dirname(AUDIT_LOG_PATH), { recursive: true });

    const entry = {
      timestamp: new Date().toISOString(),
      ...payload,
    };

    await appendFile(AUDIT_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
  } catch (error) {
    console.error("Не удалось записать audit-log:", error);
  }
}