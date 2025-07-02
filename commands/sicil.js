const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Uyarıları saklamak için dosya yolu
const warningsPath = path.join(__dirname, '..', 'data', 'warnings.json');

// Uyarıları yükle
function loadWarnings() {
    try {
        if (fs.existsSync(warningsPath)) {
            const data = fs.readFileSync(warningsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Uyarılar yüklenirken hata:', error);
    }
    return {};
}

module.exports = {
    name: 'sicil',
    description: 'Bir kullanıcının moderasyon geçmişini gösterir',
    usage: '!sicil <@kullanıcı>',
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
                .setDescription('Doğru kullanım: `!sicil <@kullanıcı>`')
                .addFields(
                    { name: 'Örnek', value: '`!sicil @kullanıcı`', inline: true }
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
                .setDescription('Lütfen sicilini görmek istediğiniz kullanıcıyı etiketleyin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Uyarıları yükle
            const warnings = loadWarnings();
            
            // Kullanıcının uyarılarını al
            const userWarnings = warnings[message.guild.id]?.[targetUser.id] || [];
            
            // Ban geçmişini kontrol et (Discord API'den)
            let banHistory = [];
            try {
                const banInfo = await message.guild.bans.fetch(targetUser.id);
                banHistory.push({
                    reason: banInfo.reason || 'Sebep belirtilmedi',
                    timestamp: 'Bilinmiyor'
                });
            } catch (error) {
                // Kullanıcı banlanmamış
            }

            // Sicil embed'i oluştur
            const sicilEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`📋 ${targetUser.username} Sicil Raporu`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Kullanıcı', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '📅 Hesap Oluşturma', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: true },
                    { name: '📊 Toplam Uyarı', value: `${userWarnings.length}`, inline: true }
                )
                .setFooter({ text: `ID: ${targetUser.id}` })
                .setTimestamp();

            // Uyarı geçmişi varsa ekle
            if (userWarnings.length > 0) {
                let warningsText = '';
                userWarnings.slice(-5).forEach((warning, index) => {
                    const date = new Date(warning.timestamp);
                    warningsText += `**${index + 1}.** ${warning.reason}\n`;
                    warningsText += `└ Uyaran: <@${warning.moderator}> | <t:${Math.floor(date.getTime() / 1000)}:R>\n\n`;
                });
                
                if (userWarnings.length > 5) {
                    warningsText += `*... ve ${userWarnings.length - 5} uyarı daha*`;
                }
                
                sicilEmbed.addFields({
                    name: `⚠️ Son ${Math.min(5, userWarnings.length)} Uyarı`,
                    value: warningsText || 'Uyarı bulunamadı',
                    inline: false
                });
            } else {
                sicilEmbed.addFields({
                    name: '⚠️ Uyarı Geçmişi',
                    value: 'Bu kullanıcının hiç uyarısı yok.',
                    inline: false
                });
            }

            // Ban geçmişi varsa ekle
            if (banHistory.length > 0) {
                let banText = '';
                banHistory.forEach((ban, index) => {
                    banText += `**${index + 1}.** ${ban.reason}\n`;
                });
                
                sicilEmbed.addFields({
                    name: '🔨 Ban Geçmişi',
                    value: banText,
                    inline: false
                });
            }

            // Kullanıcının sunucuya katılma tarihi
            const member = message.guild.members.cache.get(targetUser.id);
            if (member) {
                sicilEmbed.addFields({
                    name: '📥 Sunucuya Katılma',
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                    inline: true
                });
            }

            await message.reply({ embeds: [sicilEmbed] });

        } catch (error) {
            console.error('Sicil hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Sicil Hatası')
                .setDescription('Kullanıcının sicili alınırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 