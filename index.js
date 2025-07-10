const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');
const fs = require('fs');
const path = require('path');
const { connectToDatabase, closeConnection } = require('./utils/database');

// Bot client'ını oluştur
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Komutları saklamak için collection
client.commands = new Collection();

// MongoDB'ye bağlan
async function initializeDatabase() {
    try {
        await connectToDatabase();
    } catch (error) {
        console.error('❌ Veritabanı başlatılamadı:', error);
        process.exit(1);
    }
}

// Komutları yükle
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`✅ Komut yüklendi: ${command.name}`);
        } else {
            console.log(`❌ Komut yüklenemedi: ${file} - gerekli özellikler eksik`);
        }
    }
}

// Event handler'ları yükle
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    if (fs.existsSync(eventsPath)) {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const eventModule = require(filePath);
            
            if (eventModule.events) {
                for (const [eventName, eventHandler] of Object.entries(eventModule.events)) {
                    client.on(eventName, eventHandler);
                    console.log(`✅ Event handler yüklendi: ${eventName}`);
                }
            }
        }
    }
}

// Bot hazır olduğunda
client.once('ready', async () => {
    console.log(`🤖 ${client.user.tag} olarak giriş yapıldı!`);
    console.log(`📊 ${client.guilds.cache.size} sunucuda aktif`);
    
    // MongoDB'ye bağlan
    await initializeDatabase();
    
    console.log('🚀 Moderasyon komutları hazır!');
});

// Mesaj geldiğinde
client.on('messageCreate', async message => {
    // Bot mesajlarını yoksay
    if (message.author.bot) return;
    
    const prefix = '!';
    
    // Prefix ile başlamıyorsa yoksay
    if (!message.content.startsWith(prefix)) return;
    
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Komutları işle
    const command = client.commands.get(commandName) || 
                   client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) {
        // Eski komutları kontrol et
        switch (commandName) {
            case 'ping':
                const pingEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('🏓 Pong!')
                    .setDescription(`Bot gecikmesi: ${client.ws.ping}ms`)
                    .setTimestamp();
                await message.reply({ embeds: [pingEmbed] });
                break;
                
            case 'zar':
            case 'zarat':
                const zarSonucu = Math.floor(Math.random() * 6) + 1;
                await message.reply(`🎲 Zar atıldı: **${zarSonucu}**`);
                break;
                
            case 'yazitura':
            case 'yazıtura':
                const sonuc = Math.random() < 0.5 ? 'Yazı' : 'Tura';
                await message.reply(`🪙 **${sonuc}** geldi!`);
                break;
                
            case 'sunucu':
            case 'server':
                const serverEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`📊 ${message.guild.name} Sunucu Bilgileri`)
                    .addFields(
                        { name: '👥 Üye Sayısı', value: `${message.guild.memberCount}`, inline: true },
                        { name: '📅 Oluşturulma Tarihi', value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`, inline: true },
                        { name: '👑 Sunucu Sahibi', value: `<@${message.guild.ownerId}>`, inline: true }
                    )
                    .setThumbnail(message.guild.iconURL())
                    .setTimestamp();
                await message.reply({ embeds: [serverEmbed] });
                break;
                
            case 'yardim':
            case 'yardım':
            case 'help':
                const helpEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('🤖 PudiBot Komutları')
                    .setDescription('İşte kullanabileceğiniz komutlar:')
                    .addFields(
                        { name: '🏓 Ping', value: '`!ping` - Bot gecikmesini göster', inline: true },
                        { name: '🎲 Zar', value: '`!zar` - Zar at', inline: true },
                        { name: '🪙 Yazı Tura', value: '`!yazitura` - Yazı tura at', inline: true },
                        { name: '📊 Sunucu', value: '`!sunucu` - Sunucu bilgilerini göster', inline: true },
                        { name: '🔇 Mute', value: '`!mute <@kullanıcı> <süre> <sebep>` - Kullanıcıyı mute et', inline: true },
                        { name: '🔊 Unmute', value: '`!unmute <@kullanıcı> <sebep>` - Kullanıcının mute\'ını kaldır', inline: true },
                        { name: '🔨 Ban', value: '`!ban <@kullanıcı> <sebep>` - Kullanıcıyı banla', inline: true },
                        { name: '🔓 Unban', value: '`!unban <kullanıcı_id> <sebep>` - Kullanıcının banını kaldır', inline: true },
                        { name: '👢 Kick', value: '`!kick <@kullanıcı> <sebep>` - Kullanıcıyı at', inline: true },
                        { name: '⚠️ Warn', value: '`!warn <@kullanıcı> <sebep>` - Kullanıcıyı uyar', inline: true },
                        { name: '✅ Unwarn', value: '`!unwarn <@kullanıcı> <uyarı_id> <sebep>` - Uyarıyı kaldır', inline: true },
                        { name: '📋 Sicil', value: '`!sicil <@kullanıcı>` - Kullanıcının sicilini göster', inline: true },
                        { name: '🧹 Temizle', value: '`!temizle <sayı> [@kullanıcı]` - Mesaj sil', inline: true },
                        { name: '📝 Log Ayarları', value: '`!mutelog <#kanal>` - Mute log kanalı\n`!banlog <#kanal>` - Ban log kanalı\n`!warnlog <#kanal>` - Warn log kanalı\n`!mesajlog ayarla <#kanal>` - Mesaj log kanalı\n`!mesajlog muaf-ekle <#kanal>` - Kanalı muaf listesine ekle\n`!mesajlog muaf-kaldir <#kanal>` - Kanalı muaf listesinden kaldır\n`!mesajlog muaf-listesi` - Muaf kanalları listele\n`!gelengidenlog gelen <#kanal>` - Gelen log kanalı\n`!gelengidenlog giden <#kanal>` - Giden log kanalı', inline: false }
                    )
                    .setFooter({ text: 'PudiBot v1 - Temel Moderasyon Sistemi' })
                    .setTimestamp();
                await message.reply({ embeds: [helpEmbed] });
                break;
                
            default:
                await message.reply('❓ Bilinmeyen komut! `!yardim` yazarak komutları görebilirsin.');
                break;
        }
        return;
    }

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Komut hatası (${commandName}):`, error);
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Komut Hatası')
            .setDescription('Komut çalıştırılırken bir hata oluştu!')
            .addFields(
                { name: 'Komut', value: commandName, inline: true },
                { name: 'Hata', value: error.message, inline: false }
            )
            .setTimestamp();
        await message.reply({ embeds: [errorEmbed] });
    }
});

// Hata yakalama
client.on('error', error => {
    console.error('Bot hatası:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Bot kapatılıyor...');
    await closeConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Bot kapatılıyor...');
    await closeConnection();
    process.exit(0);
});

// Komutları ve event'leri yükle
loadCommands();
loadEvents();

// Botu başlat
client.login(token); 