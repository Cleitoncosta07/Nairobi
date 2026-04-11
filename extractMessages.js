const { PREFIX } = require("./settings.json")

exports.extractMessages = async (messageDetails, sock) => {

  try {

    const msg = messageDetails?.message

    const extendedTextMessage = msg?.extendedTextMessage?.text
    const conversation = msg?.conversation
    const imageCaption = msg?.imageMessage?.caption
    const videoCaption = msg?.videoMessage?.caption

    // 🧠 pega qualquer tipo de texto possível
    const finalMessageText =
      extendedTextMessage ||
      conversation ||
      imageCaption ||
      videoCaption ||
      ""

    const from = messageDetails?.key?.remoteJid

    const isCommand = finalMessageText.startsWith(PREFIX)

    const commandName = isCommand
      ? finalMessageText.slice(PREFIX.length).trim().split(/ +/).shift().toLowerCase()
      : ""

    const args = isCommand
      ? finalMessageText.split(/ +/).slice(1).join(" ")
      : ""

    const userName = messageDetails?.pushName || "Usuário"

    const participant =
      from.includes("@g.us")
        ? messageDetails?.key?.participant
        : from

    const userMention =
      msg?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
      msg?.extendedTextMessage?.contextInfo?.participant ||
      null

    const numberUserMention = userMention
      ? userMention.split("@")[0]
      : null

    const BOT_PHONE = sock?.user?.id?.split(":")[0] + "@s.whatsapp.net"

    return {
      BOT_PHONE,
      finalMessageText,
      from,
      isCommand,
      commandName,
      args,
      userName,
      participant,
      userMention,
      numberUserMention
    }

  } catch (err) {
    console.log("❌ Erro no extractMessages:", err)

    return {
      isCommand: false,
      commandName: "",
      args: "",
      from: "",
      userName: ""
    }
  }
}