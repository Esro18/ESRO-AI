const { Client, GatewayIntentBits, AttachmentBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function translate(text, from, to) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.responseData.translatedText;
}

const commands = [
    new SlashCommandBuilder()
        .setName('translate-ar-2')
        .setDescription('ترجمة من إنجليزي إلى عربي')
        .addStringOption(opt => opt.setName('text').setDescription('النص').setRequired(false)),
    new SlashCommandBuilder()
        .setName('translate-en-2')
        .setDescription('ترجمة من عربي إلى إنجليزي')
        .addStringOption(opt => opt.setName('text').setDescription('النص').setRequired(false))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const text = interaction.options.getString('text') || '';
    let images = [];

    if (interaction.channel.lastMessage?.attachments) {
        interaction.channel.lastMessage.attachments.forEach(att => {
            if (images.length < 10) images.push(att.url);
        });
    }

    if (!text && images.length === 0) {
        return interaction.reply({ content: 'أرسل نص أو صور قبل استخدام الأمر.', ephemeral: true });
    }

    let translated;

    if (interaction.commandName === 'translate-ar-2') {
        translated = await translate(text, 'en', 'ar');
    } else if (interaction.commandName === 'translate-en-2') {
        translated = await translate(text, 'ar', 'en');
    }

    const files = images.map(url => new AttachmentBuilder(url));

    await interaction.reply({
        content: translated,
        files: files
    });
});

client.login(process.env.TOKEN);
// =====================================================
// ====================== النهاية ========================
// =====================================================

// تم بناء هذا النظام بالكامل بواسطة:
// ESRO AI — Discord Bot
// جميع الحقوق محفوظة لدى Esro Store ❤️