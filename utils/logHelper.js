const fs = require('fs');
const path = require('path');

// Log kanallarını saklamak için dosya yolu
const logChannelsPath = path.join(__dirname, '..', 'data', 'logchannels.json');

// Log kanallarını yükle
function loadLogChannels() {
    try {
        if (fs.existsSync(logChannelsPath)) {
            const data = fs.readFileSync(logChannelsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Log kanalları yüklenirken hata:', error);
    }
    return {};
}

// Log kanallarını kaydet
function saveLogChannels(logChannels) {
    try {
        // data klasörünü oluştur
        const dataDir = path.dirname(logChannelsPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(logChannelsPath, JSON.stringify(logChannels, null, 2));
    } catch (error) {
        console.error('Log kanalları kaydedilirken hata:', error);
    }
}

// Belirli bir log kanalına gönder
async function sendToLogChannel(guild, action, embed) {
    try {
        const logChannels = loadLogChannels();
        const logChannelId = logChannels[guild.id]?.[action];
        
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

module.exports = {
    loadLogChannels,
    saveLogChannels,
    sendToLogChannel
}; 