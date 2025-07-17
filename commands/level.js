const { getLevelData, getUserRank } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'level',
    aliases: ['lvl', 'seviye', 'xp'],
    description: 'Kendi seviyeni ve XP bilgisini gösterir.',
    async execute(message, args) {
        if (!message.guild) return message.reply('Bu komut sadece sunucularda kullanılabilir.');
        
        // Kullanıcıyı belirle (mention, ID veya kendisi)
        let targetUser = message.author;
        if (args.length > 0) {
            const mentionedUser = message.mentions.users.first();
            if (mentionedUser) {
                targetUser = mentionedUser;
            } else {
                const userId = args[0];
                try {
                    targetUser = await message.client.users.fetch(userId);
                } catch (e) {
                    targetUser = null;
                }
            }
        }
        if (!targetUser) {
            return message.reply("Lütfen geçerli bir kullanıcıyı etiketleyin veya ID girin!");
        }
        const data = await getLevelData(message.guild.id, targetUser.id);
        const rank = await getUserRank(message.guild.id, targetUser.id);
        
        // Birikimli XP sistemine göre doğru seviye ve ilerleme hesaplama
        let baseXP = 100;
        let totalXP = data.xp;
        let level = 0;
        let requiredTotalXP = 0;
        let nextLevelTotalXP = 0;
        // Hangi seviyede olduğunu bul
        while (totalXP >= nextLevelTotalXP) {
            requiredTotalXP = nextLevelTotalXP;
            nextLevelTotalXP += Math.floor(baseXP * Math.pow(1.2, level));
            if (totalXP >= nextLevelTotalXP) level++;
        }
        // İlerleme hesaplama
        let currentLevelXP = totalXP - requiredTotalXP;
        let levelXPNeeded = nextLevelTotalXP - requiredTotalXP;
        let progress = Math.min((currentLevelXP / levelXPNeeded) * 100, 100);

        // Progress bar oluşturma
        const progressBarLength = 10;
        const filledBlocks = Math.floor((progress / 100) * progressBarLength);
        const emptyBlocks = progressBarLength - filledBlocks;
        const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🎯 Seviye Bilgileri')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Kullanıcı', value: `${targetUser}`, inline: true },
                { name: '🏆 Seviye', value: `**${level}**`, inline: true },
                { name: '📊 Sıralama', value: `**${rank ? `#${rank}` : 'Yok'}**`, inline: true },
                { name: '📈 İlerleme', value: `${progressBar} **${Math.round(progress)}%**`, inline: false },
                { name: '⭐ Toplam XP', value: `**${totalXP}**`, inline: false },
                { name: '🎯 Sonraki Seviye İçin Gerekli XP', value: `**${nextLevelTotalXP}**`, inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Level Sistemi`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
}; 