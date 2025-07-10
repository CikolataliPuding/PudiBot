const { MongoClient } = require('mongodb');
const { mongodb } = require('./config.json');

async function viewDatabase() {
    const client = new MongoClient(mongodb.uri);
    
    try {
        await client.connect();
        console.log('✅ MongoDB\'ye bağlandı!');
        
        const db = client.db('PudiBot');
        
        // Tüm koleksiyonları listele
        const collections = await db.listCollections().toArray();
        console.log('\n📚 Mevcut Koleksiyonlar:');
        collections.forEach(col => {
            console.log(`- ${col.name}`);
        });
        
        // Her koleksiyonun içeriğini göster
        for (const collection of collections) {
            console.log(`\n📋 ${collection.name.toUpperCase()} Koleksiyonu:`);
            console.log('='.repeat(50));
            
            const documents = await db.collection(collection.name).find({}).toArray();
            
            if (documents.length === 0) {
                console.log('❌ Bu koleksiyonda henüz veri yok.');
            } else {
                console.log(`📊 Toplam ${documents.length} kayıt bulundu:`);
                documents.forEach((doc, index) => {
                    console.log(`\n${index + 1}. Kayıt:`);
                    console.log(JSON.stringify(doc, null, 2));
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await client.close();
        console.log('\n🔌 Bağlantı kapatıldı.');
    }
}

// Scripti çalıştır
viewDatabase(); 