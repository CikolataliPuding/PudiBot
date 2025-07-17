const { addXP, getLevelData, setLevel, getXPMultiplier, getXPExcludedChannels } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');
const { sendToLogChannel, getLogChannel } = require('../utils/logHelper');

// Kullanıcı başına cooldown (ms)
const XP_COOLDOWN = 60 * 1000; // 1 dakika
// Temel XP miktarı
const BASE_XP = Math.floor(Math.random() * (15 - 5 + 1)) + 5; // 5–15 XP

// Kullanıcıların son XP kazandığı zamanı tutmak için
const userCooldowns = new Map();

module.exports = {
    events: {
        messageCreate: async (message) => {
            if (message.author.bot) return;
            if (!message.guild) return;

            // XP kazandırmayan kanallar
            const excludedChannels = await getXPExcludedChannels(message.guild.id);
            if (excludedChannels.includes(message.channel.id)) return;

            // Cooldown kontrolü
            const key = `${message.guild.id}-${message.author.id}`;
            const now = Date.now();
            if (userCooldowns.has(key) && now - userCooldowns.get(key) < XP_COOLDOWN) return;
            userCooldowns.set(key, now);

            // Kullanıcının en yüksek rolüne göre XP katsayısı
            let multiplier = 1;
            if (message.member && message.member.roles.cache.size > 0) {
                // En yüksek rolü bul
                const roles = [...message.member.roles.cache.values()].sort((a, b) => b.position - a.position);
                for (const role of roles) {
                    multiplier = await getXPMultiplier(message.guild.id, role.id);
                    if (multiplier !== 1) break;
                }
            }

            const xpToAdd = BASE_XP * multiplier;
            const userData = await addXP(message.guild.id, message.author.id, xpToAdd);

            // userData null kontrolü
            if (!userData) {
                console.error(`XP ekleme hatası: ${message.author.tag} için userData null`);
                return;
            }

            // Birikimli XP ile doğru level up kontrolü
            let baseXP = 100;
            let totalXP = userData.xp;
            let currentLevel = 0;
            let requiredTotalXP = 0;
            let nextLevelTotalXP = 0;
            // Hangi seviyede olduğunu bul
            while (totalXP >= nextLevelTotalXP) {
                requiredTotalXP = nextLevelTotalXP;
                nextLevelTotalXP += Math.floor(baseXP * Math.pow(1.2, currentLevel));
                if (totalXP >= nextLevelTotalXP) currentLevel++;
            }
            // Eğer veritabanındaki level ile gerçek level farklıysa güncelle ve mesaj gönder
            if (currentLevel > userData.level) {
                await setLevel(message.guild.id, message.author.id, currentLevel);
                const embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎉 Tebrikler!')
                    .setDescription(`${message.author} **${currentLevel}. seviyeye** ulaştın!`)
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '🏆 Yeni Seviye', value: `**${currentLevel}**`, inline: true },
                        { name: '⭐ Toplam XP', value: `**${totalXP}**`, inline: true },
                        { name: '🎯 Sonraki Seviye', value: `**${nextLevelTotalXP}** XP`, inline: true }
                    )
                    .setFooter({ text: `${message.guild.name} • Level Sistemi`, iconURL: message.guild.iconURL({ dynamic: true }) })
                    .setTimestamp();
                // Level up mesajı için log kanalını kontrol et
                let logChannelId = await getLogChannel(message.guild.id, 'levelup');
                if (logChannelId === 'current' || !logChannelId) {
                    message.channel.send({ embeds: [embed] });
                } else {
                    sendToLogChannel(message.guild, 'levelup', embed);
                }
            }
        }
    }
}; 