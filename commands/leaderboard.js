const { getLeaderboard, getUserRank, getLevelData } = require('../utils/database');
const { Collection, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'Sunucudaki en yüksek seviyeye sahip ilk 10 kişiyi ve kendi sıranı gösterir.',
    async execute(message, args) {
        if (!message.guild) return message.reply('Bu komut sadece sunucularda kullanılabilir.');
        
        const leaderboard = await getLeaderboard(message.guild.id, 10);
        const rank = await getUserRank(message.guild.id, message.author.id);
        const data = await getLevelData(message.guild.id, message.author.id);
        
        let leaderboardText = '';
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        
        for (let i = 0; i < leaderboard.length; i++) {
            const user = await message.guild.members.fetch(leaderboard[i].userId).catch(() => null);
            const medal = medals[i] || `${i + 1}.`;
            const username = user ? user.user.username : 'Bilinmeyen Kullanıcı';
            const avatar = user ? user.user.displayAvatarURL({ dynamic: true }) : null;
            
            leaderboardText += `${medal} **${username}**\n└ Seviye: **${leaderboard[i].level}** | XP: **${leaderboard[i].xp}**\n\n`;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Sunucu Level Sıralaması')
            .setDescription(leaderboardText || 'Henüz kimse XP kazanmamış!')
            .addFields(
                { name: '👤 Senin Bilgilerin', value: `Sıralama: **${rank ? `#${rank}` : 'Yok'}**\nSeviye: **${data.level}**\nXP: **${data.xp}**`, inline: false }
            )
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .setFooter({ text: `${message.guild.name} • Top 10 Sıralama`, iconURL: message.guild.iconURL({ dynamic: true }) })
            .setTimestamp();
        
        message.reply({ embeds: [embed] });
    }
}; 