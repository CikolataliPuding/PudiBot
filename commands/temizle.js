const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');

module.exports = {
    name: 'temizle',
    description: 'Belirtilen sayıda mesajı siler',
    usage: ['!temizle <sayı> [@kullanıcı]', 
        '!sil <sayı> [@kullanıcı]', 
        '!clear <sayı> [@kullanıcı]'],
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu kullanmak için **Mesajları Yönet** yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot yetkisi kontrolü
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Bot Yetkisi Hatası')
                .setDescription('Bot\'un **Mesajları Yönet** yetkisi yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Argüman kontrolü
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!temizle <sayı> [@kullanıcı]`')
                .addFields(
                    { name: 'Örnekler', value: '`!temizle 10` - Son 10 mesajı sil\n`!temizle 50 @kullanıcı` - Kullanıcının son 50 mesajını sil', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sayı kontrolü
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Geçersiz Sayı')
                .setDescription('Lütfen 1-100 arası bir sayı girin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            let deletedCount = 0;
            const targetUser = message.mentions.users.first();

            if (targetUser) {
                // Belirli kullanıcının mesajlarını sil
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const userMessages = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
                
                if (userMessages.length > 0) {
                    await message.channel.bulkDelete(userMessages);
                    deletedCount = userMessages.length;
                }
            } else {
                // Son N mesajı sil
                const messages = await message.channel.messages.fetch({ limit: amount + 1 });
                const messagesToDelete = messages.filter(msg => !msg.pinned).first(amount);
                
                if (messagesToDelete.length > 0) {
                    await message.channel.bulkDelete(messagesToDelete);
                    deletedCount = messagesToDelete.length;
                }
            }

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🧹 Mesajlar Temizlendi')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '📊 Silinen Mesaj', value: `${deletedCount}`, inline: true },
                    { name: '🛡️ Temizleyen', value: `${message.author}`, inline: true },
                    { name: '📝 Hedef', value: targetUser ? `${targetUser}` : 'Tüm mesajlar', inline: true }
                )
                .setFooter({ text: `Kanal: ${message.channel.name}` })
                .setTimestamp();

            const replyMessage = await message.reply({ embeds: [successEmbed] });

            // 5 saniye sonra başarı mesajını sil
            setTimeout(() => {
                replyMessage.delete().catch(() => {});
            }, 5000);

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'clear', successEmbed);

        } catch (error) {
            console.error('Temizleme hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Temizleme Hatası')
                .setDescription('Mesajlar silinirken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 