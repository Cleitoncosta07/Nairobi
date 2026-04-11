const fs = require("fs");
const { extractMessages } = require("./extractMessages.js");
const { setupMessagingServices } = require("./messagingServices/setupMessagingServices.js");

// ✔ CORREÇÃO PRINCIPAL (SEM {} )
const menuCaption = require("./features/menuCaption.js");

const { verifyPermissions } = require("./verifyPermissions.js");
const { contarMensagem } = require("./mensagens/contarMensagem.js");
const { toggle } = require("./mensagens/toggle.js");

const bemVindo = JSON.parse(fs.readFileSync("data/bemVindo.json"));
const { PREFIX } = require("./settings.json");

exports.handleCommands = async (sock) => {

  sock.ev.on("messages.upsert", async ({ messages }) => {

    const messageDetails = messages[0];
    if (!messageDetails) return;

    const {
      BOT_PHONE,
      from,
      isCommand,
      commandName,
      args,
      userName,
      participant,
      userMention,
      numberUserMention
    } = await extractMessages(messageDetails, sock);

    const {
      reagir,
      enviarImagem,
      enviarMensagem,
      enviarImagemUrl,
      enviarGifUrl
    } = setupMessagingServices(sock, from, messageDetails);

    const searchUserLogin = await contarMensagem(messageDetails, from, participant);

    const { isAdmin, isBotAdmin, isOwnerGroup } =
      await verifyPermissions(sock, from, participant, isCommand, BOT_PHONE) || {};

    try {

      switch (commandName) {

        case "bemvindo":
          if (!searchUserLogin) return enviarMensagem(`Use ${PREFIX}login`);
          if (!isAdmin) return enviarMensagem("vc precisa ser adm");
          if (!isBotAdmin) return enviarMensagem("Bot precisa ser adm");

          await toggle(messageDetails, sock, bemVindo, "bem-vindo", "data/bemVindo.json");
          break;

        case "login":
          const { commandLogin } = require("./commands/users/commandLogin.js");
          await commandLogin(searchUserLogin, enviarMensagem, args, from, participant, reagir);
          break;

        case "menu":
case "help":
  if (!searchUserLogin) {
    return enviarMensagem(`Use ${PREFIX}login`);
  }

  await sock.sendMessage(from, {
    image: fs.readFileSync("assets/imagens/menu.jpg"),
    caption: menuCaption(userName),

    footer: "💎 Nairobi Bot",

    buttonText: "📌 Abrir Menu",

    sections: [
      {
        title: "💠 Geral",
        rows: [
          { title: "👤 Perfil", rowId: `${PREFIX}perfil` },
          { title: "⚡ Ping", rowId: `${PREFIX}ping` },
          { title: "🎮 Brincadeiras", rowId: `${PREFIX}brincadeiras` }
        ]
      },
      {
        title: "🛡 Administração",
        rows: [
          { title: "🚫 Ban", rowId: `${PREFIX}ban` },
          { title: "📢 Marcar Todos", rowId: `${PREFIX}marcartodos` }
        ]
      },
      {
        title: "💎 Premium",
        rows: [
          { title: "💎 Menu Premium", rowId: `${PREFIX}premium` }
        ]
      }
    ]
  }, { quoted: messageDetails });

  break;

        case "beijar":
          if (!searchUserLogin) return enviarMensagem(`Use ${PREFIX}login`);
          if (!userMention) return enviarMensagem("Marque alguém");
          if (userMention === participant) return enviarMensagem("Você não pode se beijar");

          const textBeijo = `Woww você deu um beijo no @${numberUserMention}! 😘`;

          await enviarGifUrl(
            "https://telegra.ph/file/c9b5ed858237ebc9f7356.mp4",
            textBeijo,
            [userMention]
          );
          break;

        case "ping":
        case "latencia":
          if (!searchUserLogin) return enviarMensagem(`Use ${PREFIX}login`);

          const uptime = process.uptime();
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);

          let latency = Math.abs((Date.now() / 1000) - messageDetails.messageTimestamp);

          await reagir("⚡");
          enviarMensagem(
            `*Latência:* ${latency.toFixed(3)}s\n*Online:* ${hours}h ${minutes}m ${seconds}s`
          );
          break;

        case "deletar":
          if (!searchUserLogin) return enviarMensagem(`Use ${PREFIX}login`);
          if (!isAdmin) return enviarMensagem("Precisa ser adm");
          if (!isBotAdmin) return enviarMensagem("Bot precisa ser adm");

          sock.sendMessage(from, {
            delete: {
              remoteJid: from,
              fromMe: false,
              id: messageDetails.message?.extendedTextMessage?.contextInfo?.stanzaId,
              participant: messageDetails.message?.extendedTextMessage?.contextInfo?.participant
            }
          });
          break;

        case "marcartodos":
          if (!searchUserLogin) return enviarMensagem(`Use ${PREFIX}login`);

          const { commandMarcar } = require("./commands/admin/commandMarcar");
          await commandMarcar(isAdmin, isBotAdmin, args, sock, from, enviarMensagem);
          break;

      }

    } catch (error) {
      console.log("Erro:", error);
      enviarMensagem("❌ Ocorreu um erro interno");
    }

  });

};