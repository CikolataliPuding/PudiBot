const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel } = require('../utils/database');

module.exports = {
    name: 'warnlog',
    description: 'Warn log kanalını ayarlar',
    usage: '!warnlog <#kanal>',
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
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!warnlog <#kanal>`')
                .addFields(
                    { name: 'Örnek', value: '`!warnlog #warn-log`', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kanalı al
        const channel = message.mentions.channels.first();
        if (!channel) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kanal Bulunamadı')
                .setDescription('Lütfen geçerli bir kanal etiketleyin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kanalın yazma yetkisi var mı kontrol et
        if (!channel.permissionsFor(message.guild.members.me).has('SendMessages')) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Bot Yetkisi Hatası')
                .setDescription('Bot\'un bu kanala mesaj gönderme yetkisi yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // MongoDB'ye warn log kanalını kaydet
            const success = await setLogChannel(message.guild.id, 'warn', channel.id);
            
            if (!success) {
                throw new Error('Log kanalı veritabanına kaydedilemedi');
            }

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Warn Log Kanalı Ayarlandı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '📝 Kanal', value: `${channel}`, inline: true },
                    { name: '🛡️ Ayalayan', value: `${message.author}`, inline: true },
                    { name: '📊 Kanal ID', value: channel.id, inline: true }
                )
                .setFooter({ text: 'Artık warn işlemleri bu kanala loglanacak' })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Warn log ayarlama hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Ayar Hatası')
                .setDescription('Warn log kanalı ayarlanırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
};
