const { MongoClient } = require('mongodb');
const { mongodb } = require('../config.json');

// MongoDB bağlantı URL'si
const MONGODB_URI = mongodb.uri;

let client;
let db;

// MongoDB'ye bağlan
async function connectToDatabase() {
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('PudiBot');
        console.log('✅ MongoDB\'ye başarıyla bağlandı!');
        return db;
    } catch (error) {
        console.error('❌ MongoDB bağlantı hatası:', error);
        throw error;
    }
}

// Veritabanı bağlantısını al
function getDatabase() {
    return db;
}

// Bağlantıyı kapat
async function closeConnection() {
    if (client) {
        await client.close();
        console.log('🔌 MongoDB bağlantısı kapatıldı');
    }
}

// Uyarılar koleksiyonu işlemleri
const warningsCollection = () => db.collection('warnings');

// Uyarı ekle
async function addWarning(guildId, userId, warning) {
    try {
        const collection = warningsCollection();
        await collection.updateOne(
            { guildId, userId },
            { 
                $push: { warnings: warning },
                $setOnInsert: { guildId, userId }
            },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Uyarı ekleme hatası:', error);
        return false;
    }
}

// Kullanıcının uyarılarını getir
async function getWarnings(guildId, userId) {
    try {
        const collection = warningsCollection();
        const result = await collection.findOne({ guildId, userId });
        return result ? result.warnings : [];
    } catch (error) {
        console.error('Uyarı getirme hatası:', error);
        return [];
    }
}

// Belirli bir uyarıyı kaldır
async function removeWarning(guildId, userId, warningId) {
    try {
        const collection = warningsCollection();
        await collection.updateOne(
            { guildId, userId },
            { $pull: { warnings: { warningId } } }
        );
        return true;
    } catch (error) {
        console.error('Uyarı kaldırma hatası:', error);
        return false;
    }
}

// Tüm uyarıları getir (guild için)
async function getAllWarnings(guildId) {
    try {
        const collection = warningsCollection();
        const results = await collection.find({ guildId }).toArray();
        const warnings = {};
        results.forEach(result => {
            warnings[result.userId] = result.warnings;
        });
        return warnings;
    } catch (error) {
        console.error('Tüm uyarıları getirme hatası:', error);
        return {};
    }
}

// Log kanalları koleksiyonu işlemleri
const logChannelsCollection = () => db.collection('logChannels');

// Log kanalı ayarla
async function setLogChannel(guildId, action, channelId) {
    try {
        const collection = logChannelsCollection();
        await collection.updateOne(
            { guildId },
            { $set: { [action]: channelId } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Log kanalı ayarlama hatası:', error);
        return false;
    }
}

// Log kanalını getir
async function getLogChannel(guildId, action) {
    try {
        const collection = logChannelsCollection();
        const result = await collection.findOne({ guildId });
        return result ? result[action] : null;
    } catch (error) {
        console.error('Log kanalı getirme hatası:', error);
        return null;
    }
}

// Tüm log kanallarını getir
async function getAllLogChannels(guildId) {
    try {
        const collection = logChannelsCollection();
        const result = await collection.findOne({ guildId });
        return result || {};
    } catch (error) {
        console.error('Log kanalları getirme hatası:', error);
        return {};
    }
}

// Mesaj log muaf kanalları koleksiyonu
const messageLogExemptCollection = () => db.collection('messageLogExempt');

// Muaf kanal ekle
async function addMessageLogExempt(guildId, channelId) {
    try {
        const collection = messageLogExemptCollection();
        await collection.updateOne(
            { guildId },
            { $addToSet: { exemptChannels: channelId } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Muaf kanal ekleme hatası:', error);
        return false;
    }
}

// Muaf kanal kaldır
async function removeMessageLogExempt(guildId, channelId) {
    try {
        const collection = messageLogExemptCollection();
        await collection.updateOne(
            { guildId },
            { $pull: { exemptChannels: channelId } }
        );
        return true;
    } catch (error) {
        console.error('Muaf kanal kaldırma hatası:', error);
        return false;
    }
}

// Muaf kanalları getir
async function getMessageLogExempt(guildId) {
    try {
        const collection = messageLogExemptCollection();
        const result = await collection.findOne({ guildId });
        return result ? result.exemptChannels : [];
    } catch (error) {
        console.error('Muaf kanalları getirme hatası:', error);
        return [];
    }
}

// LEVEL SİSTEMİ KOLEKSİYONU
const levelsCollection = () => db.collection('levels');

// Kullanıcıya XP ekle
async function addXP(guildId, userId, xp) {
    try {
        const collection = levelsCollection();
        const result = await collection.findOneAndUpdate(
            { guildId, userId },
            { $inc: { xp: xp }, $setOnInsert: { level: 0 } },
            { upsert: true, returnDocument: 'after' }
        );
        
        // Eğer result.value null ise, varsayılan değerlerle döndür
        if (!result.value) {
            return { guildId, userId, xp: xp, level: 0 };
        }
        
        return result.value;
    } catch (error) {
        console.error('XP ekleme hatası:', error);
        // Hata durumunda varsayılan değerlerle döndür
        return { guildId, userId, xp: xp, level: 0 };
    }
}

// Kullanıcı level ve XP bilgisini getir
async function getLevelData(guildId, userId) {
    try {
        const collection = levelsCollection();
        const result = await collection.findOne({ guildId, userId });
        return result || { guildId, userId, xp: 0, level: 0 };
    } catch (error) {
        console.error('Level verisi getirme hatası:', error);
        return { guildId, userId, xp: 0, level: 0 };
    }
}

// Kullanıcıya level ata
async function setLevel(guildId, userId, level) {
    try {
        const collection = levelsCollection();
        await collection.updateOne(
            { guildId, userId },
            { $set: { level: level } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Level ayarlama hatası:', error);
        return false;
    }
}

// Leaderboard (ilk N kişi)
async function getLeaderboard(guildId, limit = 10) {
    try {
        const collection = levelsCollection();
        const results = await collection.find({ guildId }).sort({ level: -1, xp: -1 }).limit(limit).toArray();
        return results;
    } catch (error) {
        console.error('Leaderboard getirme hatası:', error);
        return [];
    }
}

// Kullanıcının sırasını getir
async function getUserRank(guildId, userId) {
    try {
        const collection = levelsCollection();
        const all = await collection.find({ guildId }).sort({ level: -1, xp: -1 }).toArray();
        const index = all.findIndex(u => u.userId === userId);
        return index === -1 ? null : index + 1;
    } catch (error) {
        console.error('Kullanıcı sırası getirme hatası:', error);
        return null;
    }
}

// XP katsayıları koleksiyonu
const xpMultipliersCollection = () => db.collection('xpMultipliers');

// Rol için XP katsayısı ayarla
async function setXPMultiplier(guildId, roleId, multiplier) {
    try {
        const collection = xpMultipliersCollection();
        await collection.updateOne(
            { guildId, roleId },
            { $set: { multiplier } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('XP katsayısı ayarlama hatası:', error);
        return false;
    }
}

// Rolün XP katsayısını getir
async function getXPMultiplier(guildId, roleId) {
    try {
        const collection = xpMultipliersCollection();
        const result = await collection.findOne({ guildId, roleId });
        return result ? result.multiplier : 1;
    } catch (error) {
        console.error('XP katsayısı getirme hatası:', error);
        return 1;
    }
}

// Tüm XP katsayılarını getir
async function getAllXPMultipliers(guildId) {
    try {
        const collection = xpMultipliersCollection();
        const results = await collection.find({ guildId }).toArray();
        return results;
    } catch (error) {
        console.error('XP katsayıları getirme hatası:', error);
        return [];
    }
}

// XP kazandırmayan kanallar koleksiyonu
const xpExcludedChannelsCollection = () => db.collection('xpExcludedChannels');

// XP kazandırmayan kanal ekle
async function addXPExcludedChannel(guildId, channelId) {
    try {
        const collection = xpExcludedChannelsCollection();
        await collection.updateOne(
            { guildId },
            { $addToSet: { channels: channelId } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('XP muaf kanal ekleme hatası:', error);
        return false;
    }
}

// XP kazandırmayan kanal kaldır
async function removeXPExcludedChannel(guildId, channelId) {
    try {
        const collection = xpExcludedChannelsCollection();
        await collection.updateOne(
            { guildId },
            { $pull: { channels: channelId } }
        );
        return true;
    } catch (error) {
        console.error('XP muaf kanal kaldırma hatası:', error);
        return false;
    }
}

// XP kazandırmayan kanalları getir
async function getXPExcludedChannels(guildId) {
    try {
        const collection = xpExcludedChannelsCollection();
        const result = await collection.findOne({ guildId });
        return result ? result.channels : [];
    } catch (error) {
        console.error('XP muaf kanallar getirme hatası:', error);
        return [];
    }
}

// OTOROL SİSTEMİ KOLEKSİYONU
const autoRoleCollection = () => db.collection('autoRole');

// Otorol ayarla
async function setAutoRole(guildId, roleId) {
    try {
        const collection = autoRoleCollection();
        await collection.updateOne(
            { guildId },
            { $set: { roleId: roleId } },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Otorol ayarlama hatası:', error);
        return false;
    }
}

// Otorol getir
async function getAutoRole(guildId) {
    try {
        const collection = autoRoleCollection();
        const result = await collection.findOne({ guildId });
        return result ? result.roleId : null;
    } catch (error) {
        console.error('Otorol getirme hatası:', error);
        return null;
    }
}

// Otorol kaldır
async function removeAutoRole(guildId) {
    try {
        const collection = autoRoleCollection();
        await collection.deleteOne({ guildId });
        return true;
    } catch (error) {
        console.error('Otorol kaldırma hatası:', error);
        return false;
    }
}

module.exports = {
    connectToDatabase,
    getDatabase,
    closeConnection,
    addWarning,
    getWarnings,
    removeWarning,
    getAllWarnings,
    setLogChannel,
    getLogChannel,
    getAllLogChannels,
    addMessageLogExempt,
    removeMessageLogExempt,
    getMessageLogExempt,
    // LEVEL SİSTEMİ
    addXP,
    getLevelData,
    setLevel,
    getLeaderboard,
    getUserRank,
    setXPMultiplier,
    getXPMultiplier,
    getAllXPMultipliers,
    addXPExcludedChannel,
    removeXPExcludedChannel,
    getXPExcludedChannels,
    // OTOROL SİSTEMİ
    setAutoRole,
    getAutoRole,
    removeAutoRole
}; 