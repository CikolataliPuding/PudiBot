const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { setXPMultiplier, getAllXPMultipliers, addXPExcludedChannel, removeXPExcludedChannel, getXPExcludedChannels } = require('../utils/database');

module.exports = {
    name: 'levelsistem',
    description: 'Level sistemi ayarlarını yapar (sadece yetkililer).',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('Bu komutu sadece sunucu yöneticileri kullanabilir.');
        }
        
        const sub = args[0];
        if (!sub) {
            const embed = new EmbedBuilder()
                .setColor('#4ECDC4')
                .setTitle('⚙️ Level Sistemi Ayarları')
                .setDescription('Level sistemi yönetim komutları:')
                .addFields(
                    { name: '🎯 XP Katsayısı Ayarla', value: '`!levelsistem katsayi <@rol> <katsayi>`', inline: false },
                    { name: '🚫 XP Kapat', value: '`!levelsistem kanal-ekle <#kanal>`', inline: false },
                    { name: '✅ XP Aç', value: '`!levelsistem kanal-kaldir <#kanal>`', inline: false },
                    { name: '📋 Mevcut Ayarlar', value: '`!levelsistem liste`', inline: false }
                )
                .setFooter({ text: 'Sadece yöneticiler kullanabilir', iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        if (sub === 'katsayi') {
            const role = message.mentions.roles.first();
            const multiplier = parseFloat(args[2]);
            if (!role || isNaN(multiplier)) {
                return message.reply('❌ Kullanım: `!levelsistem katsayi <@rol> <katsayi>`');
            }
            
            await setXPMultiplier(message.guild.id, role.id, multiplier);
            
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('✅ XP Katsayısı Ayarlandı')
                .setDescription(`${role} rolü için XP katsayısı **${multiplier}x** olarak ayarlandı.`)
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        if (sub === 'kanal-ekle') {
            const channel = message.mentions.channels.first();
            if (!channel) {
                return message.reply('❌ Kullanım: `!levelsistem kanal-ekle <#kanal>`');
            }
            
            await addXPExcludedChannel(message.guild.id, channel.id);
            
            const embed = new EmbedBuilder()
                .setColor('#FF9800')
                .setTitle('🚫 XP Kazanımı Kapatıldı')
                .setDescription(`${channel} kanalında XP kazanımı kapatıldı.`)
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        if (sub === 'kanal-kaldir') {
            const channel = message.mentions.channels.first();
            if (!channel) {
                return message.reply('❌ Kullanım: `!levelsistem kanal-kaldir <#kanal>`');
            }
            
            await removeXPExcludedChannel(message.guild.id, channel.id);
            
            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('✅ XP Kazanımı Açıldı')
                .setDescription(`${channel} kanalında XP kazanımı tekrar açıldı.`)
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        if (sub === 'liste') {
            const katsayilar = await getAllXPMultipliers(message.guild.id);
            const kanallar = await getXPExcludedChannels(message.guild.id);
            
            let katsayiText = '';
            for (const k of katsayilar) {
                const role = message.guild.roles.cache.get(k.roleId);
                katsayiText += `• ${role ? role.name : 'Bilinmeyen Rol'}: **${k.multiplier}x**\n`;
            }
            
            let kanalText = '';
            for (const id of kanallar) {
                const channel = message.guild.channels.cache.get(id);
                kanalText += `• ${channel ? channel.name : 'Bilinmeyen Kanal'}\n`;
            }
            
            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle('📋 Level Sistemi Ayarları')
                .addFields(
                    { name: '🎯 XP Katsayıları', value: katsayiText || 'Ayarlanmamış', inline: false },
                    { name: '🚫 XP Kazandırmayan Kanallar', value: kanalText || 'Yok', inline: false }
                )
                .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }
        
        return message.reply('❌ Bilinmeyen alt komut. `!levelsistem` yazarak kullanımı görebilirsin.');
    }
}; 