import WebSocket from "ws";

const taskId = process.env.MONKEYCODE_TASK_ID;
const session = process.env.MONKEYCODE_SESSION;
const base = (process.env.MONKEYCODE_BASE || "https://monkeycode-ai.net").replace(/\/$/, "");
const holdMs = Number(process.env.HOLD_MS || 240000);

if (!taskId) throw new Error("MONKEYCODE_TASK_ID missing");
if (!session) throw new Error("MONKEYCODE_SESSION missing");

const wsBase = base.replace(/^https:/, "wss:").replace(/^http:/, "ws:");
const url = wsBase + "/api/v1/users/tasks/control?id=" + encodeURIComponent(taskId);

const started = Date.now();
let lastMessage = 0;
let pingCount = 0;

console.log("Connecting Task Control WebSocket...");
console.log("Task:", taskId.slice(0, 8) + "..." + taskId.slice(-4));
console.log("Hold seconds:", Math.round(holdMs / 1000));

const ws = new WebSocket(url, {
  headers: {
    Cookie: "monkeycode_ai_session=" + session,
    "User-Agent": "MonkeyCode-GitHub-Keepalive/1.0"
  },
  handshakeTimeout: 20000
});

const timeout = setTimeout(() => {
  console.error("Timed out before keepalive window completed");
  try { ws.terminate(); } catch {}
  process.exitCode = 1;
}, holdMs + 30000);

ws.on("open", () => {
  console.log("CONTROL_CONNECTED");
});

ws.on("message", data => {
  lastMessage = Date.now();
  try {
    const msg = JSON.parse(String(data));
    if (msg?.type === "ping") {
      pingCount++;
      if (pingCount === 1 || pingCount % 6 === 0) {
        console.log("server ping", pingCount, "elapsed_s", Math.round((Date.now() - started) / 1000));
      }
    }
  } catch {}
});

ws.on("unexpected-response", (_req, res) => {
  console.error("WebSocket rejected with HTTP", res.statusCode);
  if (res.statusCode === 401 || res.statusCode === 403) {
    console.error("MONKEYCODE_SESSION is expired or invalid");
  }
});

ws.on("error", err => {
  console.error("WebSocket error:", err.message);
});

ws.on("close", (code, reason) => {
  clearTimeout(timeout);
  const elapsed = Date.now() - started;
  console.log("CONTROL_CLOSED", code, String(reason || ""), "elapsed_s", Math.round(elapsed / 1000));
  console.log("server_ping_count", pingCount);
  if (elapsed < 60000 || pingCount === 0) process.exitCode = 1;
});

setTimeout(() => {
  console.log("Keepalive window complete; closing normally");
  try { ws.close(1000, "keepalive complete"); } catch {}
}, holdMs);
