const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel } = require('../utils/database');

module.exports = {
    name: 'gelengidenlog',
    description: 'Gelen ve giden log kanallarını ayarlar',
    usage: '!gelengidenlog <gelen|giden> <#kanal>',
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu kullanmak için **Yönetici** yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Argüman kontrolü
        if (args.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!gelengidenlog <gelen|giden> <#kanal>`')
                .addFields(
                    { name: 'Örnekler', value: '`!gelengidenlog gelen #gelen-log`\n`!gelengidenlog giden #giden-log`', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        const type = args[0].toLowerCase();
        const channel = message.mentions.channels.first();

        if (!channel) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kanal Bulunamadı')
                .setDescription('Lütfen bir kanal etiketleyin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        if (type !== 'gelen' && type !== 'giden') {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Geçersiz Tip')
                .setDescription('Tip sadece `gelen` veya `giden` olabilir!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // MongoDB'ye log kanalını kaydet
            const logType = type === 'gelen' ? 'joinLog' : 'leaveLog';
            const success = await setLogChannel(message.guild.id, logType, channel.id);
            
            if (!success) {
                throw new Error('Log kanalı veritabanına kaydedilemedi');
            }

            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Log Kanalı Ayarlandı')
                .addFields(
                    { name: '📝 Tip', value: type === 'gelen' ? '👋 Gelen Log' : '👋 Giden Log', inline: true },
                    { name: '📺 Kanal', value: `${channel}`, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Log kanalı ayarlama hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Log Kanalı Hatası')
                .setDescription('Log kanalı ayarlanırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 