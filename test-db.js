const { MongoClient } = require('mongodb');
const { mongodb } = require('./config.json');

async function testDatabase() {
    const client = new MongoClient(mongodb.uri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB\'ye bağlandı!');
        
        const db = client.db('PudiBot');
        
        // Test verileri oluştur
        console.log('\n🧪 Test verileri oluşturuluyor...');
        
        // 1. Warnings koleksiyonu test verisi
        const warningsCollection = db.collection('warnings');
        await warningsCollection.insertOne({
            guildId: '1234567890123456789',
            userId: '9876543210987654321',
            warnings: [
                {
                    reason: 'Spam yapma',
                    moderator: '111222333444555666',
                    moderatorName: 'TestMod#1234',
                    timestamp: Date.now(),
                    warningId: Date.now().toString()
                }
            ]
        });
        console.log('✅ Test uyarısı eklendi');
        
        // 2. LogChannels koleksiyonu test verisi
        const logChannelsCollection = db.collection('logChannels');
        await logChannelsCollection.insertOne({
            guildId: '1234567890123456789',
            warn: '1111111111111111111',
            ban: '2222222222222222222',
            mute: '3333333333333333333',
            message: '4444444444444444444',
            joinLog: '5555555555555555555',
            leaveLog: '6666666666666666666'
        });
        console.log('✅ Test log kanalları eklendi');
        
        // 3. MessageLogExempt koleksiyonu test verisi
        const messageLogExemptCollection = db.collection('messageLogExempt');
        await messageLogExemptCollection.insertOne({
            guildId: '1234567890123456789',
            exemptChannels: ['7777777777777777777', '8888888888888888888']
        });
        console.log('✅ Test muaf kanalları eklendi');
        
        // Verileri kontrol et
        console.log('\n📊 Oluşturulan Veriler:');
        console.log('='.repeat(50));
        
        const collections = ['warnings', 'logChannels', 'messageLogExempt'];
        
        for (const collectionName of collections) {
            console.log(`\n📋 ${collectionName.toUpperCase()}:`);
            const documents = await db.collection(collectionName).find({}).toArray();
            console.log(`📊 ${documents.length} kayıt bulundu`);
            documents.forEach((doc, index) => {
                console.log(`\n${index + 1}. Kayıt:`);
                console.log(JSON.stringify(doc, null, 2));
            });
        }
        
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Bağlantı kapatıldı.');
    }
}

// Test scriptini çalıştır
testDatabase(); 