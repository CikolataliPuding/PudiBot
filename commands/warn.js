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

        // Kullanıcıyı al
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Kullanıcı Bulunamadı')
                .setDescription('Lütfen uyarılacak kullanıcıyı etiketleyin!')
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
            // Uyarıları yükle
            const warnings = loadWarnings();
            
            // Sunucu ID'si yoksa oluştur
            if (!warnings[message.guild.id]) {
                warnings[message.guild.id] = {};
            }
            
            // Kullanıcı ID'si yoksa oluştur
            if (!warnings[message.guild.id][targetUser.id]) {
                warnings[message.guild.id][targetUser.id] = [];
            }

            // Yeni uyarı ekle
            const newWarning = {
                reason: reason,
                moderator: message.author.id,
                moderatorName: message.author.tag,
                timestamp: Date.now(),
                warningId: Date.now().toString()
            };

            warnings[message.guild.id][targetUser.id].push(newWarning);
            
            // Uyarıları kaydet
            saveWarnings(warnings);

            // Toplam uyarı sayısı
            const totalWarnings = warnings[message.guild.id][targetUser.id].length;

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