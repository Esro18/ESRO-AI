const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// =========================
//  تعريف أمر /send-msg
// =========================

const sendMsgCommand = new SlashCommandBuilder()
    .setName('send-msg')
    .setDescription('إرسال رسالة + صور + منشن اختياري لرتبة')
    .addChannelOption(opt =>
        opt.setName('channel')
           .setDescription('الروم الذي سيتم إرسال الرسالة إليه')
           .setRequired(true)
    )
    .addStringOption(opt =>
        opt.setName('text')
           .setDescription('النص الذي سيتم إرساله')
           .setRequired(false)
    )
    .addRoleOption(opt =>
        opt.setName('role')
           .setDescription('رتبة اختيارية لعمل منشن لها')
           .setRequired(false)
    );

// إضافة 10 صور
for (let i = 1; i <= 10; i++) {
    sendMsgCommand.addAttachmentOption(opt =>
        opt.setName(`image${i}`)
           .setDescription(`صورة ${i}`)
           .setRequired(false)
    );
}

const commands = [sendMsgCommand.toJSON()];

// =========================
//  تسجيل الأوامر
// =========================

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('⏳ جاري تسجيل الأوامر...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('✅ تم تسجيل الأوامر بنجاح.');
    } catch (error) {
        console.error(error);
    }
})();

// =========================
//  تشغيل البوت
// =========================

client.on('ready', () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);
});

// =========================
//  تنفيذ أمر /send-msg
// =========================

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'send-msg') {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const text = interaction.options.getString('text') || '';
        const role = interaction.options.getRole('role');

        const files = [];

        // التقاط 10 صور
        for (let i = 1; i <= 10; i++) {
            const img = interaction.options.getAttachment(`image${i}`);
            if (img) files.push(img);
        }

        if (!text && files.length === 0 && !role) {
            return interaction.editReply('❌ لازم ترسل نص أو صورة أو منشن.');
        }

        let finalMessage = "";

        if (role) {
            finalMessage += `${role}\n`;
        }

        if (text) {
            finalMessage += text;
        }

        await channel.send({
            content: finalMessage,
            files: files
        });

        return interaction.editReply('✅ تم إرسال الرسالة بنجاح.');
    }
});

client.login(process.env.TOKEN);

// =====================================================
// ====================== النهاية ========================
// =====================================================

// تم بناء هذا النظام بالكامل بواسطة:
// ESRO AI — Discord Bot
// جميع الحقوق محفوظة لدى Esro Store ❤️