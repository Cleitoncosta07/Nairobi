const path = require("path");
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require("baileys");

const readline = require("readline");
const pino = require("pino");

const { handleCommands } = require("./handleCommands.js");
const { participantsUpdate } = require("./participantsUpdate.js");

// 🎭 delay (animação)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const question = (text) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
};

// 🎬 BANNER PREMIUM
async function banner() {
  console.clear();

  const frames = [
`█ NAIROBI PREMIUM █`,
`██ NAIROBI PREMIUM ██`,
`███ NAIROBI PREMIUM ███`,
`████ NAIROBI PREMIUM ████`,
  ];

  for (const frame of frames) {
    console.clear();
    console.log("\n🔥 INICIANDO SISTEMA...\n");
    console.log(frame);
    await sleep(300);
  }

  console.log("\n⚡ Sistema carregado...\n");
}

async function connect() {
  await banner();

  const { state, saveCreds } = await useMultiFileAuthState(
    path.resolve(__dirname, "assets", "auth", "creds")
  );

  const { version } = await fetchLatestBaileysVersion();

  console.log("📡 Conectando ao WhatsApp...");
  await sleep(800);

  const sock = makeWASocket({
    printQRInTerminal: false,
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Nairobi Premium", "Chrome", "1.0.0"],
    markOnlineOnConnect: true,
  });

  // 📱 Pairing Code
  if (!sock.authState.creds.registered) {
    let phoneNumber = await question("📱 Digite seu número: ");
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");

    if (!phoneNumber) {
      console.log("❌ Número inválido!");
      return connect();
    }

    console.log("\n🔐 Gerando código de pareamento...\n");
    await sleep(1000);

    const code = await sock.requestPairingCode(phoneNumber);

    console.log("━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔥 CÓDIGO PREMIUM:");
    console.log(`👉 ${code}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  // 🔌 CONEXÃO
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ NAIROBI PREMIUM ONLINE");
      console.log("🤖 Status: ATIVO");
      console.log("⚡ Velocidade: ULTRA");
      console.log("━━━━━━━━━━━━━━━━━━━━━━\n");
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;

      const shouldReconnect =
        statusCode !== DisconnectReason.loggedOut;

      console.log("❌ Conexão perdida...");

      await sleep(1500);

      if (shouldReconnect) {
        console.log("🔄 Reconectando sistema premium...\n");
        connect();
      } else {
        console.log("🚫 Logout detectado. Reinicie manualmente.");
      }
    }
  });

  sock.ev.on("creds.update", saveCreds);

  handleCommands(sock);
  participantsUpdate(sock);

  return sock;
}

connect();