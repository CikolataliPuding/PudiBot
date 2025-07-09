const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');

module.exports = {
    name: 'unban',
    description: 'Bir kullanıcının banını kaldırır',
    usage: '!unban <kullanıcı_id> <sebep>',
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu kullanmak için **Üyeleri Yasakla** yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot yetkisi kontrolü
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Bot Yetkisi Hatası')
                .setDescription('Bot\'un **Üyeleri Yasakla** yetkisi yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Argüman kontrolü
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!unban <kullanıcı_id> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!unban 123456789012345678 Ban kaldırıldı`', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcı ID'sini al
        const userId = args[0];
        if (!/^\d{17,19}$/.test(userId)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Geçersiz Kullanıcı ID')
                .setDescription('Lütfen geçerli bir kullanıcı ID\'si girin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Kullanıcının banlanıp banlanmadığını kontrol et
            const banList = await message.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Kullanıcı Banlanmamış')
                    .setDescription('Bu kullanıcı zaten banlanmamış!')
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Sebep
            const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

            // Kullanıcının banını kaldır
            await message.guild.members.unban(userId, reason);

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔓 Kullanıcının Banı Kaldırıldı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Kullanıcı', value: `${bannedUser.user.tag} (${userId})`, inline: true },
                    { name: '🛡️ Unban Eden', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${userId}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'unban', successEmbed);



        } catch (error) {
            console.error('Unban hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Unban Hatası')
                .setDescription('Kullanıcının banı kaldırılırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 