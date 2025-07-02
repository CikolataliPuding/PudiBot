const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');

module.exports = {
    name: 'ban',
    description: 'Bir kullanıcıyı sunucudan banlar',
    usage: '!ban <@kullanıcı> <sebep>',
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
                .setDescription('Doğru kullanım: `!ban <@kullanıcı> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!ban @kullanıcı Kuralları ihlal etti`', inline: true }
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
                .setDescription('Lütfen banlanacak kullanıcıyı etiketleyin!')
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

        // Kendini banlamaya çalışıyorsa
        if (targetUser.id === message.author.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Kendinizi banlayamazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot'u banlamaya çalışıyorsa
        if (targetUser.id === message.client.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Bot\'u banlayamazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sunucu sahibini banlamaya çalışıyorsa
        if (targetUser.id === message.guild.ownerId) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Sunucu sahibini banlayamazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Yetki hiyerarşisi kontrolü
        if (targetMember.roles.highest.position >= message.member.roles.highest.position) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Yetki Hatası')
                .setDescription('Bu kullanıcıyı banlamak için yeterli yetkiniz yok!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sebep
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        try {
            // Kullanıcıyı banla
            await targetMember.ban({ reason: reason });

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🔨 Kullanıcı Banlandı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Banlanan', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Banlayan', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${targetUser.id}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'ban', successEmbed);

        } catch (error) {
            console.error('Ban hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Ban Hatası')
                .setDescription('Kullanıcı banlanırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 