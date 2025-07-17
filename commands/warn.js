const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');
const { addWarning, getWarnings } = require('../utils/database');

module.exports = {
    name: 'warn',
    description: 'Bir kullanıcıya uyarı verir',
    usage: '!warn <@kullanıcı> <sebep>',
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

        // Argüman kontrolü
        if (args.length < 1) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!warn <@kullanıcı> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!warn @kullanıcı Spam yapma`', inline: true }
                )
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Kullanıcıyı al (mention veya ID)
        let targetUser = message.mentions.users.first();
        if (!targetUser) {
            // Eğer mention yoksa, ID ile bulmayı dene
            const userId = args[0];
            try {
                targetUser = await message.client.users.fetch(userId);
            } catch (e) {
                targetUser = null;
            }
        }
        if (!targetUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription("Lütfen uyarılacak kullanıcıyı etiketleyin veya geçerli bir kullanıcı ID'si girin!")
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

        // Kendini uyarmaya çalışıyorsa
        if (targetUser.id === message.author.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Kendinizi uyaramazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Bot'u uyarmaya çalışıyorsa
        if (targetUser.id === message.client.user.id) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Hata')
                .setDescription('Bot\'u uyaramazsınız!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        // Sebep
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        try {
            // Yeni uyarı oluştur
            const newWarning = {
                reason: reason,
                moderator: message.author.id,
                moderatorName: message.author.tag,
                timestamp: Date.now(),
                warningId: Date.now().toString()
            };

            // MongoDB'ye uyarı ekle
            const success = await addWarning(message.guild.id, targetUser.id, newWarning);
            
            if (!success) {
                throw new Error('Uyarı veritabanına eklenemedi');
            }

            // Mevcut uyarıları getir
            const warnings = await getWarnings(message.guild.id, targetUser.id);
            const totalWarnings = warnings.length;

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('⚠️ Kullanıcı Uyarıldı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Uyarılan', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Uyaran', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '📊 Toplam Uyarı', value: `${totalWarnings}`, inline: true },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${targetUser.id} | Uyarı ID: ${newWarning.warningId}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'warn', successEmbed);

            // Kullanıcıya DM gönder
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#ffff00')
                    .setTitle('⚠️ Uyarı Aldınız')
                    .setDescription(`${message.guild.name} sunucusunda uyarı aldınız.`)
                    .addFields(
                        { name: '🛡️ Uyaran', value: `${message.author.tag}`, inline: true },
                        { name: '📊 Toplam Uyarı', value: `${totalWarnings}`, inline: true },
                        { name: '📝 Sebep', value: reason, inline: false }
                    )
                    .setFooter({ text: `Sunucu: ${message.guild.name}` })
                    .setTimestamp();

                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`${targetUser.tag} kullanıcısına DM gönderilemedi: ${dmError.message}`);
            }

        } catch (error) {
            console.error('Warn hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Warn Hatası')
                .setDescription('Kullanıcı uyarılırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 