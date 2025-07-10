const fs = require('fs');
const path = require('path');
const { connectToDatabase, addWarning, setLogChannel, addMessageLogExempt } = require('./utils/database');

async function migrateData() {
    try {
        console.log('🔄 MongoDB\'ye bağlanılıyor...');
        await connectToDatabase();
        console.log('✅ MongoDB bağlantısı başarılı!');

        // Uyarıları aktar
        console.log('📋 Uyarılar aktarılıyor...');
        const warningsPath = path.join(__dirname, 'data', 'warnings.json');
        if (fs.existsSync(warningsPath)) {
            const warningsData = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
            
            for (const [guildId, users] of Object.entries(warningsData)) {
                for (const [userId, userWarnings] of Object.entries(users)) {
                    for (const warning of userWarnings) {
                        await addWarning(guildId, userId, warning);
                    }
                }
            }
            console.log('✅ Uyarılar başarıyla aktarıldı!');
        } else {
            console.log('ℹ️ Uyarı dosyası bulunamadı, atlanıyor...');
        }

        // Log kanallarını aktar
        console.log('📝 Log kanalları aktarılıyor...');
        const logChannelsPath = path.join(__dirname, 'data', 'logchannels.json');
        if (fs.existsSync(logChannelsPath)) {
            const logChannelsData = JSON.parse(fs.readFileSync(logChannelsPath, 'utf8'));
            
            for (const [guildId, channels] of Object.entries(logChannelsData)) {
                for (const [channelType, channelId] of Object.entries(channels)) {
                    await setLogChannel(guildId, channelType, channelId);
                }
            }
            console.log('✅ Log kanalları başarıyla aktarıldı!');
        } else {
            console.log('ℹ️ Log kanalları dosyası bulunamadı, atlanıyor...');
        }

        // Muaf kanalları aktar (eğer varsa)
        console.log('🚫 Muaf kanallar aktarılıyor...');
        const exemptChannelsPath = path.join(__dirname, 'data', 'exemptChannels.json');
        if (fs.existsSync(exemptChannelsPath)) {
            const exemptChannelsData = JSON.parse(fs.readFileSync(exemptChannelsPath, 'utf8'));
            
            for (const [guildId, channelIds] of Object.entries(exemptChannelsData)) {
                for (const channelId of channelIds) {
                    await addMessageLogExempt(guildId, channelId);
                }
            }
            console.log('✅ Muaf kanallar başarıyla aktarıldı!');
        } else {
            console.log('ℹ️ Muaf kanallar dosyası bulunamadı, atlanıyor...');
        }

        console.log('🎉 Tüm veriler başarıyla MongoDB\'ye aktarıldı!');
        console.log('💡 Artık data/ klasöründeki JSON dosyalarını silebilirsiniz.');

    } catch (error) {
        console.error('❌ Migration hatası:', error);
    } finally {
        process.exit(0);
    }
}

// Migration'ı başlat
migrateData(); 