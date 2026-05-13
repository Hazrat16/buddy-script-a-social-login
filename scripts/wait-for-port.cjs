/**
 * Wait until a TCP port accepts connections (e.g. API ready before Next dev proxy).
 * Usage: node scripts/wait-for-port.cjs [PORT] [TIMEOUT_MS]
 */
const net = require("node:net");

const host = "127.0.0.1";
const port = Number(process.argv[2] || 3001);
const timeoutMs = Number(process.argv[3] || 120000);
const start = Date.now();

function tryConnect() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port }, () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => {
      resolve(false);
    });
  });
}

async function main() {
  while (Date.now() - start < timeoutMs) {
    if (await tryConnect()) {
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.error(`Timeout waiting for ${host}:${port} (${timeoutMs}ms)`);
  process.exit(1);
}

main();
