const { getLevelData, getUserRank } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'level',
    description: 'Kendi seviyeni ve XP bilgisini gösterir.',
    async execute(message, args) {
        if (!message.guild) return message.reply('Bu komut sadece sunucularda kullanılabilir.');
        
        const data = await getLevelData(message.guild.id, message.author.id);
        const rank = await getUserRank(message.guild.id, message.author.id);
        
        // XP progress bar hesaplama
        const currentLevelXP = data.xp - (data.level * 100);
        const nextLevelXP = 100 * (data.level + 1);
        const progress = Math.min((currentLevelXP / 100) * 100, 100);
        
        // Progress bar oluşturma
        const progressBarLength = 10;
        const filledBlocks = Math.floor((progress / 100) * progressBarLength);
        const emptyBlocks = progressBarLength - filledBlocks;
        const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
        
        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🎯 Seviye Bilgileri')
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Kullanıcı', value: `${message.author}`, inline: true },
                { name: '🏆 Seviye', value: `**${data.level}**`, inline: true },
                { name: '📊 Sıralama', value: `**${rank ? `#${rank}` : 'Yok'}**`, inline: true },


                { name: '📈 İlerleme', value: `${progressBar} **${Math.round(progress)}%**`, inline: false }
            )
            .setFooter({ text: `${message.guild.name} • Level Sistemi`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
}; 