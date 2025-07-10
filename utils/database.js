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
    getMessageLogExempt
}; 