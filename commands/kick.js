const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');

module.exports = {
    name: 'kick',
    description: 'Bir kullanıcıyı sunucudan atar',
    usage: '!kick <@kullanıcı> <sebep>',
    async execute(message, args) {
        // Yetki kontrolü
        if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu komutu kullanmak için **Üyeleri At** yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot yetkisi kontrolü
        if (!message.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Bot Yetkisi Hatası')
                .setDescription('Bot\'un **Üyeleri At** yetkisi yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Argüman kontrolü
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!kick <@kullanıcı> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!kick @kullanıcı Uygunsuz davranış`', inline: true }
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
                .setDescription('Lütfen atılacak kullanıcıyı etiketleyin!')
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

        // Kendini atmaya çalışıyorsa
        if (targetUser.id === message.author.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Kendinizi atamazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot'u atmaya çalışıyorsa
        if (targetUser.id === message.client.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Bot\'u atamazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sunucu sahibini atmaya çalışıyorsa
        if (targetUser.id === message.guild.ownerId) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Sunucu sahibini atamazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Yetki hiyerarşisi kontrolü
        if (targetMember.roles.highest.position >= message.member.roles.highest.position) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu kullanıcıyı atmak için yeterli yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sebep
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        try {
            // Kullanıcıyı at
            await targetMember.kick(reason);

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#ffa500')
                .setTitle('👢 Kullanıcı Atıldı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Atılan', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Atan', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${targetUser.id}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'kick', successEmbed);

        } catch (error) {
            console.error('Kick hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kick Hatası')
                .setDescription('Kullanıcı atılırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 