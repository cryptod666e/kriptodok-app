/**
 * Talks to kriptodok-backend's telemetry endpoints. Every call here is
 * best-effort: a failed request must never interrupt the app — the user
 * came here to use KriptoDok, not to see a telemetry error.
 */
const osModule = require('os');

// Версия ОС (например, "10.0.22631"). Windows 11 тоже сообщает 10.0 — отличить её
// от Windows 10 можно только по номеру сборки (22000+), это делает сервер.
function osVersion() {
  try { return osModule.release(); } catch (_err) { return undefined; }
}

async function postJson(url, body, timeoutMs = 4000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res.ok;
  } catch (err) {
    console.warn(`[telemetry] запрос к ${url} не удался:`, err.message);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function sendHeartbeat({ backendUrl, installId, version, email }) {
  return postJson(`${backendUrl}/api/telemetry/heartbeat`, { installId, version, email, osVersion: osVersion() });
}

function sendInstallEvent({ backendUrl, installId, version, os, arch, email }) {
  return postJson(`${backendUrl}/api/telemetry/install`, { installId, version, os, arch, email, osVersion: osVersion() });
}

module.exports = { sendHeartbeat, sendInstallEvent };
