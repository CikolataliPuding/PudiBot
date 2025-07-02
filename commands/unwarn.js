const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { sendToLogChannel } = require('../utils/logHelper');
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

// Uyarıları kaydet
function saveWarnings(warnings) {
    try {
        // data klasörünü oluştur
        const dataDir = path.dirname(warningsPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
    } catch (error) {
        console.error('Uyarılar kaydedilirken hata:', error);
    }
}

module.exports = {
    name: 'unwarn',
    description: 'Bir kullanıcının uyarısını kaldırır',
    usage: '!unwarn <@kullanıcı> <uyarı_id> <sebep>',
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
        if (args.length < 2) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanım Hatası')
                .setDescription('Doğru kullanım: `!unwarn <@kullanıcı> <uyarı_id> [sebep]`')
                .addFields(
                    { name: 'Örnek', value: '`!unwarn @kullanıcı 1234567890 Uyarı kaldırıldı`', inline: true }
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
                .setDescription('Lütfen uyarısı kaldırılacak kullanıcıyı etiketleyin!')
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

        // Uyarı ID'sini al
        const warningId = args[1];
        if (!/^\d+$/.test(warningId)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Geçersiz Uyarı ID')
                .setDescription('Lütfen geçerli bir uyarı ID\'si girin!')
                .setTimestamp();
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            // Uyarıları yükle
            const warnings = loadWarnings();
            
            // Kullanıcının uyarılarını al
            const userWarnings = warnings[message.guild.id]?.[targetUser.id] || [];
            
            if (userWarnings.length === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Uyarı Bulunamadı')
                    .setDescription('Bu kullanıcının hiç uyarısı yok!')
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Uyarıyı bul
            const warningIndex = userWarnings.findIndex(warning => warning.warningId === warningId);
            
            if (warningIndex === -1) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Uyarı Bulunamadı')
                    .setDescription('Bu ID\'ye sahip uyarı bulunamadı!')
                    .addFields(
                        { name: 'Mevcut Uyarılar', value: userWarnings.map(w => `ID: ${w.warningId} - ${w.reason}`).join('\n'), inline: false }
                    )
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Silinecek uyarıyı al
            const removedWarning = userWarnings[warningIndex];

            // Uyarıyı sil
            userWarnings.splice(warningIndex, 1);
            
            // Uyarıları kaydet
            saveWarnings(warnings);

            // Sebep
            const reason = args.slice(2).join(' ') || 'Sebep belirtilmedi';

            // Başarı embed'i
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Uyarı Kaldırıldı')
                .setThumbnail('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif')
                .addFields(
                    { name: '👤 Kullanıcı', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: '🛡️ Uyarı Kaldıran', value: `${message.author} (${message.author.id})`, inline: true },
                    { name: '📊 Kalan Uyarı', value: `${userWarnings.length}`, inline: true },
                    { name: '🗑️ Kaldırılan Uyarı', value: removedWarning.reason, inline: false },
                    { name: '📝 Sebep', value: reason, inline: false }
                )
                .setFooter({ text: `ID: ${targetUser.id} | Uyarı ID: ${warningId}` })
                .setTimestamp();

            await message.reply({ embeds: [successEmbed] });

            // Log kanalına gönder
            await sendToLogChannel(message.guild, 'unwarn', successEmbed);

        } catch (error) {
            console.error('Unwarn hatası:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Unwarn Hatası')
                .setDescription('Uyarı kaldırılırken bir hata oluştu!')
                .addFields(
                    { name: 'Hata Detayı', value: error.message, inline: false }
                )
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
}; 