const { EmbedBuilder } = require('discord.js');
const { getLogChannel, getMessageLogExempt } = require('../utils/database');

// Kanal muaf mı kontrol et
async function isChannelExempt(guildId, channelId) {
    try {
        const exemptChannels = await getMessageLogExempt(guildId);
        return exemptChannels.includes(channelId);
    } catch (error) {
        console.error('Muaf kanal kontrolü hatası:', error);
        return false;
    }
}

// Mesaj log kanalına gönder
async function sendToMessageLog(guild, embed) {
    try {
        const messageLogChannelId = await getLogChannel(guild.id, 'message');
        
        if (messageLogChannelId) {
            const logChannel = guild.channels.cache.get(messageLogChannelId);
            if (logChannel && logChannel.permissionsFor(guild.members.me).has('SendMessages')) {
                await logChannel.send({ embeds: [embed] });
                return true;
            }
        }
        
        // Eğer özel log kanalı yoksa, genel mod-log kanalını dene
        const generalLogChannel = guild.channels.cache.find(channel => 
            channel.name.includes('mod-log') || 
            channel.name.includes('log')
        );
        
        if (generalLogChannel && generalLogChannel.permissionsFor(guild.members.me).has('SendMessages')) {
            await generalLogChannel.send({ embeds: [embed] });
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Mesaj log kanalına gönderme hatası:', error);
        return false;
    }
}

module.exports = {
    name: 'messageLog',
    events: {
        // Mesaj silindiğinde
        messageDelete: async (message) => {
            if (message.author?.bot) return;
            
            // Kanal muaf mı kontrol et
            if (await isChannelExempt(message.guild.id, message.channel.id)) return;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🗑️ Mesaj Silindi')
                .setThumbnail(message.author?.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Kullanıcı', value: `${message.author} (${message.author?.id})`, inline: true },
                    { name: '📝 Kanal', value: `${message.channel}`, inline: true },
                    { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '💬 Mesaj İçeriği', value: message.content || 'İçerik yok (dosya/embed)', inline: false }
                )
                .setFooter({ text: `Mesaj ID: ${message.id}` })
                .setTimestamp();

            await sendToMessageLog(message.guild, embed);
        },

        // Mesaj düzenlendiğinde
        messageUpdate: async (oldMessage, newMessage) => {
            if (oldMessage.author?.bot) return;
            if (oldMessage.content === newMessage.content) return;
            
            // Kanal muaf mı kontrol et
            if (await isChannelExempt(oldMessage.guild.id, oldMessage.channel.id)) return;

            const embed = new EmbedBuilder()
                .setColor('#ffff00')
                .setTitle('✏️ Mesaj Düzenlendi')
                .setThumbnail(oldMessage.author?.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '👤 Kullanıcı', value: `${oldMessage.author} (${oldMessage.author?.id})`, inline: true },
                    { name: '📝 Kanal', value: `${oldMessage.channel}`, inline: true },
                    { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    { name: '📝 Eski Mesaj', value: oldMessage.content || 'İçerik yok', inline: false },
                    { name: '📝 Yeni Mesaj', value: newMessage.content || 'İçerik yok', inline: false }
                )
                .setFooter({ text: `Mesaj ID: ${oldMessage.id}` })
                .setTimestamp();

            await sendToMessageLog(oldMessage.guild, embed);
        },

        // Toplu mesaj silindiğinde
        messageDeleteBulk: async (messages) => {
            const firstMessage = messages.first();
            if (!firstMessage) return;
            
            // Kanal muaf mı kontrol et
            if (await isChannelExempt(firstMessage.guild.id, firstMessage.channel.id)) return;
            
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🗑️ Toplu Mesaj Silindi')
                .addFields(
                    { name: '📝 Kanal', value: `${firstMessage.channel}`, inline: true },
                    { name: '📊 Silinen Mesaj', value: `${messages.size}`, inline: true },
                    { name: '📅 Tarih', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                )
                .setFooter({ text: 'Toplu silme işlemi' })
                .setTimestamp();

            await sendToMessageLog(firstMessage.guild, embed);
        }
    }
}; 