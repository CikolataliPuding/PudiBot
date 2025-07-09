const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');

module.exports = {
    name: 'unmute',
    description: 'Bir kullanıcının mute\'ını kaldırır',
    usage: '!unmute <@kullanıcı> <sebep>',
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu kullanmak için **Üyeleri Yönet** yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot yetkisi kontrolü
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Bot Yetkisi Hatası')
                .setDescription('Bot\'un **Üyeleri Yönet** yetkisi yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Argüman kontrolü
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!unmute <@kullanıcı> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!unmute @kullanıcı Mute kaldırıldı`', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcıyı al
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription('Lütfen unmute edilecek kullanıcıyı etiketleyin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        const targetMember = message.guild.members.cache.get(targetUser.id);
        if (!targetMember) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription('Bu kullanıcı sunucuda bulunamadı!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcının mute edilip edilmediğini kontrol et
        if (!targetMember.isCommunicationDisabled()) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Mute Edilmemiş')
                .setDescription('Bu kullanıcı zaten mute edilmemiş!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sebep
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        try {
            // Kullanıcının mute'ını kaldır
            await targetMember.timeout(null, reason);

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔊 Kullanıcının Mute\'ı Kaldırıldı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Kullanıcı', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Unmute Eden', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${targetUser.id}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'unmute', successEmbed);



        } catch (error) {
            console.error('Unmute hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Unmute Hatası')
                .setDescription('Kullanıcının mute\'ı kaldırılırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 