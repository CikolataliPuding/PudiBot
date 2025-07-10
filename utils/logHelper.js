const { getLogChannel, getAllLogChannels } = require('./database');

// Belirli bir log kanalına gönder
async function sendToLogChannel(guild, action, embed) {
    try {
        const logChannelId = await getLogChannel(guild.id, action);
        
        if (logChannelId) {
            const logChannel = guild.channels.cache.get(logChannelId);
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
        console.error('Log kanalına gönderme hatası:', error);
        return false;
    }
}

// Tüm log kanallarını getir (geriye uyumluluk için)
async function loadLogChannels() {
    try {
        return await getAllLogChannels();
    } catch (error) {
        console.error('Log kanalları yüklenirken hata:', error);
        return {};
    }
}

// Log kanallarını kaydet (geriye uyumluluk için - artık kullanılmıyor)
function saveLogChannels(logChannels) {
    console.warn('saveLogChannels fonksiyonu artık kullanılmıyor. MongoDB kullanılıyor.');
    return true;
}

module.exports = {
    loadLogChannels,
    saveLogChannels,
    sendToLogChannel
}; 