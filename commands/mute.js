const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');

module.exports = {
    name: 'mute',
    description: 'Bir kullanıcıyı mute eder',
    usage: '!mute <@kullanıcı> <süre> <sebep>',
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
        if (args.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!mute <@kullanıcı> <süre> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!mute @kullanıcı 1h Spam yapma`', inline: true },
                    { name: 'Süre Formatları', value: '`s` (saniye), `m` (dakika), `h` (saat), `d` (gün)', inline: true }
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
                .setDescription('Lütfen mute edilecek kullanıcıyı etiketleyin!')
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

        // Kendini mute etmeye çalışıyorsa
        if (targetUser.id === message.author.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Kendinizi mute edemezsiniz!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot'u mute etmeye çalışıyorsa
        if (targetUser.id === message.client.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Bot\'u mute edemezsiniz!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Süreyi hesapla
        const timeString = args[1];
        const timeMultipliers = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000
        };

        const timeMatch = timeString.match(/^(\d+)([smhd])$/);
        if (!timeMatch) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Geçersiz Süre Formatı')
                .setDescription('Geçerli süre formatları: `s` (saniye), `m` (dakika), `h` (saat), `d` (gün)')
                .addFields(
                    { name: 'Örnekler', value: '`30s`, `5m`, `2h`, `1d`', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        const timeValue = parseInt(timeMatch[1]);
        const timeUnit = timeMatch[2];
        const duration = timeValue * timeMultipliers[timeUnit];

        // Maksimum süre kontrolü (28 gün)
        if (duration > 28 * 24 * 60 * 60 * 1000) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Süre Hatası')
                .setDescription('Mute süresi maksimum 28 gün olabilir!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sebep
        const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';

        try {
            // Kullanıcıyı mute et
            await targetMember.timeout(duration, reason);

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🔇 Kullanıcı Mute Edildi')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Mute Edilen', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Mute Eden', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '⏰ Süre', value: `${timeValue}${timeUnit}`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${targetUser.id}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'mute', successEmbed);

        } catch (error) {
            console.error('Mute hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Mute Hatası')
                .setDescription('Kullanıcı mute edilirken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 