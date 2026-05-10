const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.on('ready', () => {
    console.log(`🔥 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'send-msg') return;

    await interaction.reply({ content: '📌 **وش الروم اللي تبغى أرسل فيه الرسالة؟**', ephemeral: true });

    const filter = m => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 120000 });

    let step = 0;
    let targetChannel = null;
    let useEmbed = false;
    let imageCount = 0;
    let role = null;

    collector.on('collect', async msg => {
        if (step === 0) {
            targetChannel = msg.mentions.channels.first();
            if (!targetChannel) return msg.reply('❌ منشن روم صحيح.');

            await msg.reply('🖼️ **تبغى إيمبد؟ (ايوا / لا)**');
            step++;
        }

        else if (step === 1) {
            useEmbed = msg.content.toLowerCase() === 'ايوا';
            await msg.reply('📷 **تبغى تضيف صور؟ كم صورة؟ (اكتب رقم أو لا)**');
            step++;
        }

        else if (step === 2) {
            if (!isNaN(msg.content)) {
                imageCount = parseInt(msg.content);
                if (imageCount < 0) imageCount = 0;
            }
            await msg.reply('👥 **تبغى تمنشن رتبة؟ (ايوا / لا)**');
            step++;
        }

        else if (step === 3) {
            if (msg.content.toLowerCase() === 'ايوا') {
                await msg.reply('🔔 **منشن الرتبة اللي تبغاها**');
                step++;
            } else {
                role = null;
                step = 5;
            }
        }

        else if (step === 4) {
            role = msg.mentions.roles.first();
            step = 5;
        }

        if (step === 5) {
            await msg.reply('✉️ **أرسل الآن الرسالة النهائية مع الصور**');
            step++;

            const finalCollector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });

            finalCollector.on('collect', async finalMsg => {
                let content = role ? `${role}` : '';

                if (useEmbed) {
                    const embed = new EmbedBuilder()
                        .setDescription(finalMsg.content || '')
                        .setColor('#00AEEF');

                    await targetChannel.send({
                        content: content || null,
                        embeds: [embed],
                        files: finalMsg.attachments.map(a => a)
                    });
                } else {
                    await targetChannel.send({
                        content: content ? `${content}\n${finalMsg.content}` : finalMsg.content,
                        files: finalMsg.attachments.map(a => a)
                    });
                }

                await finalMsg.reply('✅ **تم إرسال الرسالة بنجاح.**');
            });

            collector.stop();
        }
    });
});

client.login(process.env.TOKEN);

// =====================================================
// ====================== النهاية ========================
// =====================================================

// تم بناء هذا النظام بالكامل بواسطة:
// ESRO AI — Discord Bot
// جميع الحقوق محفوظة لدى Esro Store ❤️