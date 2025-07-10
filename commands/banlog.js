const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { setLogChannel } = require('../utils/database');

module.exports = {
    name: 'banlog',
    description: 'Ban log kanalını ayarlar',
    usage: '!banlog <#kanal>',
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
                .setDescription('Doğru kullanım: `!banlog <#kanal>`')
                .addFields(
                    { name: 'Örnek', value: '`!banlog #ban-log`', inline: true }
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
            // MongoDB'ye ban log kanalını kaydet
            const success = await setLogChannel(message.guild.id, 'ban', channel.id);
            
            if (!success) {
                throw new Error('Log kanalı veritabanına kaydedilemedi');
            }

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Ban Log Kanalı Ayarlandı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '📝 Kanal', value: `${channel}`, inline: true },
                    { name: '🛡️ Ayarlayan', value: `${message.author}`, inline: true },
                    { name: '📊 Kanal ID', value: channel.id, inline: true }
                )
                .setFooter({ text: 'Artık ban işlemleri bu kanala loglanacak' })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Ban log ayarlama hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Ayar Hatası')
                .setDescription('Ban log kanalı ayarlanırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 