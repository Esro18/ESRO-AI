const { 
    Client, 
    GatewayIntentBits, 
    AttachmentBuilder, 
    SlashCommandBuilder, 
    REST, 
    Routes 
} = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =======================
// دالة الترجمة
// =======================
async function translate(text, from, to) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.responseData.translatedText;
}

// =======================
// أوامر السلاش
// =======================
const commands = [
    new SlashCommandBuilder()
        .setName('translate-ar-2')
        .setDescription('ترجمة من إنجليزي إلى عربي')
        .addStringOption(opt => 
            opt.setName('text')
               .setDescription('النص')
               .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('translate-en-2')
        .setDescription('ترجمة من عربي إلى إنجليزي')
        .addStringOption(opt => 
            opt.setName('text')
               .setDescription('النص')
               .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('send-msg')
        .setDescription('إرسال رسالة وصور إلى روم محدد')
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
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// =======================
// تسجيل الأوامر
// =======================
client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

// =======================
// تنفيذ الأوامر
// =======================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({ ephemeral: false });

    const text = interaction.options.getString('text') || '';
    let images = [];

    // التقاط الصور من آخر رسالة
    if (interaction.channel.lastMessage?.attachments) {
        interaction.channel.lastMessage.attachments.forEach(att => {
            if (images.length < 10) images.push(att.url);
        });
    }

    // ============================
    // أمر الترجمة
    // ============================
    if (interaction.commandName === 'translate-ar-2' || interaction.commandName === 'translate-en-2') {

        if (!text && images.length === 0) {
            return interaction.editReply('أرسل نص أو صور قبل استخدام الأمر.');
        }

        let translated;

        if (interaction.commandName === 'translate-ar-2') {
            translated = await translate(text, 'en', 'ar');
        } else {
            translated = await translate(text, 'ar', 'en');
        }

        const files = images.map(url => new AttachmentBuilder(url));

        return interaction.editReply({
            content: translated,
            files: files
        });
    }

    // ============================
    // أمر إرسال رسالة لروم محدد
    // ============================
    if (interaction.commandName === 'send-msg') {
        const channel = interaction.options.getChannel('channel');

        if (!text && images.length === 0) {
            return interaction.editReply('أرسل نص أو صور قبل استخدام الأمر.');
        }

        const files = images.map(url => new AttachmentBuilder(url));

        await channel.send({
            content: text,
            files: files
        });

        return interaction.editReply('✅ تم إرسال الرسالة بنجاح.');
    }
});

// =======================
// تسجيل الدخول
// =======================
client.login(process.env.TOKEN);

// =====================================================
// ====================== النهاية ========================
// =====================================================

// تم بناء هذا النظام بالكامل بواسطة:
// ESRO AI — Discord Bot
// جميع الحقوق محفوظة لدى Esro Store ❤️