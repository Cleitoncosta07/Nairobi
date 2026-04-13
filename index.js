const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const readline = require('readline')
const chalk = require('chalk')
const { exec } = require('child_process')

const prefix = '!'
const donoNumero = 'SEU_NUMERO_AQUI' // ex: 5511999999999

let jaPareou = false

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

const esperar = (ms) => new Promise(res => setTimeout(res, ms))

/*━━━━━━━━━━━━━━━━━━━━━━━━━━
 🎬 INTRO + LOADING
━━━━━━━━━━━━━━━━━━━━━━━━━━*/

async function intro() {
console.clear()

const nome = "NAIROBI"
for (let i = 0; i <= nome.length; i++) {
console.clear()
console.log(chalk.red.bold(`\n\n\n        ${nome.slice(0, i)}`))
await esperar(150)
}

console.log(chalk.red(`
███████╗ █████╗ ██╗██████╗  ██████╗ ██████╗ ██╗
██╔════╝██╔══██╗██║██╔══██╗██╔═══██╗██╔══██╗██║
█████╗  ███████║██║██████╔╝██║   ██║██████╔╝██║
██╔══╝  ██╔══██║██║██╔══██╗██║   ██║██╔══██╗██║
██║     ██║  ██║██║██║  ██║╚██████╔╝██████╔╝██║
╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝
`))

await barraLoading()
}

async function barraLoading() {
process.stdout.write(chalk.green('\nIniciando sistema:\n'))

for (let i = 0; i <= 100; i++) {
process.stdout.write(`\r${chalk.green('[')}${'#'.repeat(i/5)}${' '.repeat(20 - i/5)}${chalk.green(']')} ${i}%`)
await esperar(30)
}

console.log(chalk.green('\n✔ Sistema carregado!\n'))
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━
 📋 MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━*/

function menu() {
console.log(chalk.cyan(`
╔══════════════════════╗
   🤖 NAIROBI BOT 🤖
╚══════════════════════╝

1 - 📲 Conectar Bot
2 - 🔄 Atualizar Bot
3 - 📁 Sair

Escolha:
`))
}

/*━━━━━━━━━━━━━━━━━━━━━━━━━━
 🤖 BOT
━━━━━━━━━━━━━━━━━━━━━━━━━━*/

async function ligarbot() {

await intro()
menu()

const escolha = await question('> ')

if (escolha == '2') {
console.log(chalk.yellow('🔄 Atualizando...'))
exec('git pull', (err, stdout) => {
console.log(stdout || err)
process.exit()
})
return
}

if (escolha == '3') {
console.log(chalk.red('Saindo...'))
process.exit()
}

const { state, saveCreds } = await useMultiFileAuthState('./sessao')
const { version } = await fetchLatestBaileysVersion()

const client = makeWASocket({
version,
auth: state,
logger: pino({ level: 'silent' }),
browser: Browsers.ubuntu('Chrome'),
printQRInTerminal: true
})

client.ev.on('creds.update', saveCreds)

/*━━━━━━━━━━━━━━━━━━━━━━━━━━
 📩 MENSAGENS
━━━━━━━━━━━━━━━━━━━━━━━━━━*/

client.ev.on('messages.upsert', async ({ messages }) => {
const msg = messages[0]
if (!msg.message) return

const from = msg.key.remoteJid
const body = msg.message.conversation || ''

const isDono = from.includes(donoNumero)

if (body === `${prefix}menu`) {
client.sendMessage(from, {
text: `🤖 NAIROBI BOT

!ping
!info
!dono
`
})
}

if (body === `${prefix}ping`) {
client.sendMessage(from, { text: '🏓 Pong Nairobi ⚡' })
}

if (body === `${prefix}info`) {
client.sendMessage(from, {
text: `🤖 Nairobi Bot
⚡ Versão: 3.0
🧠 Node.js + Baileys
`
})
}

/*🔐 COMANDO SÓ DO DONO*/
if (body === `${prefix}dono`) {
if (!isDono) return client.sendMessage(from, { text: '❌ Apenas o dono!' })

client.sendMessage(from, {
text: `👑 Dono autorizado`
})
}

})

/*━━━━━━━━━━━━━━━━━━━━━━━━━━
 🌐 CONEXÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━*/

client.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect, qr } = update

if (qr && !client.authState.creds.registered && !jaPareou) {
jaPareou = true

const numero = await question(chalk.yellow('📱 Digite seu número: '))
let code = await client.requestPairingCode(numero)

code = code?.match(/.{1,4}/g)?.join("-")
console.log(chalk.green(`🔑 Código: ${code}`))
}

if (connection === 'open') {
console.log(chalk.green('✅ BOT ONLINE'))
}

if (connection === 'close') {
const status = lastDisconnect?.error?.output?.statusCode

if (status !== DisconnectReason.loggedOut) {
ligarbot()
} else {
console.log(chalk.red('Sessão encerrada'))
}
}
})
}

ligarbot()
