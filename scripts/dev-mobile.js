#!/usr/bin/env node

const os = require("os");

// 1. Discover local IPv4 network address
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const localIp = getLocalIp();
const PORT = process.env.PORT || 3000;
const localUrl = `http://localhost:${PORT}`;
const networkUrl = `http://${localIp}:${PORT}`;

console.log("\n============================================================");
console.log("  ZEGAMAIL CLOUD — LOCAL & MOBILE NETWORK ACCESS");
console.log("============================================================");
console.log(`  Local Machine:  ${localUrl}`);
console.log(`  Phone on Wi-Fi: ${networkUrl}`);
console.log("============================================================\n");

// 2. Setup Tunneling & QR Code
async function startTunnel() {
  try {
    const localtunnel = require("localtunnel");
    let qrcodeTerminal = null;
    try {
      qrcodeTerminal = require("qrcode-terminal");
    } catch (e) {
      // optional
    }

    console.log("Establishing secure public tunnel for mobile device...");
    const tunnel = await localtunnel({ port: PORT });

    console.log("\n============================================================");
    console.log("  PUBLIC MOBILE TUNNEL READY");
    console.log("============================================================");
    console.log(`  Tunnel URL: ${tunnel.url}`);
    console.log("  Scan the QR code below on your phone camera:");
    console.log("------------------------------------------------------------\n");

    if (qrcodeTerminal) {
      qrcodeTerminal.generate(tunnel.url, { small: true });
    }

    console.log(`\n  Note: If localtunnel prompts for a password on your phone,`);
    console.log(`  enter this machine's public IP (shown at https://loca.lt/mytunnelpassword).\n`);

    tunnel.on("close", () => {
      console.log("Tunnel closed.");
    });
  } catch (err) {
    console.warn("Tunnel notice:", err.message);
    console.log("\n  You can access directly on Wi-Fi at:", networkUrl);
  }
}

startTunnel();
